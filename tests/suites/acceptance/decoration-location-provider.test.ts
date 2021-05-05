// TODO: rearrange imports
import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import { DecorationLocationsProvider } from '../../../src/domain/services/decoration-locations-provider';

import { process, statFile, workspace, glob, fs } from '../../builders/fake-adapters';

import buildFakeFailingProcess = process.buildFakeFailingProcess;
import buildFakeSucceedingProcess = process.buildFakeSucceedingProcess;
import buildSucceedingFakeStatFile = statFile.buildFakeSucceedingStatFile;
import buildFailingFakeStatFile = statFile.buildFakeFailingStatFile;
import buildFakedVscodeWorkspaceWithoutWorkspaceFolderAndWithoutSettings = workspace.buildFakeWorkspaceWithoutWorkspaceFolderAndWithoutSettings;
import buildFakeOverridableWorkspace = workspace.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings;
import buildFakeGlobSearchForNoMatch = glob.buildFakeGlobSearchForNoMatch;
import buildFakeFailingFs = fs.buildFakeFailingFs;
import { extensionName } from '../../../src/extension-name';

describe('DecorationLocationProvider service behavior.', () => {
  it('should be correctly instantiated with faked adapters.', () => {
    const instantiation = () => {
      new DecorationLocationsProvider({
        workspace: buildFakedVscodeWorkspaceWithoutWorkspaceFolderAndWithoutSettings(),
        statFile: buildFailingFakeStatFile(),
        processForCmakeCommand: buildFakeFailingProcess(),
        processForCmakeTarget: buildFakeFailingProcess(),
        globSearch: buildFakeGlobSearchForNoMatch(),
        fs: buildFakeFailingFs()
      });
    };

    instantiation.should.not.throw();
  });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the build tree directory can not be found and / or created though cmake command ' +
    'is invocable',
    () => {
      const provider = new DecorationLocationsProvider({
        workspace: buildFakeOverridableWorkspace(),
        statFile: buildFailingFakeStatFile(),
        processForCmakeCommand: buildFakeFailingProcess(),
        processForCmakeTarget: buildFakeFailingProcess(),
        globSearch: buildFakeGlobSearchForNoMatch(),
        fs: buildFakeFailingFs()
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions().should.eventually.be.rejectedWith(
        'Cannot find or create the build tree directory. Ensure the ' +
        `'${extensionName}: Build Tree Directory' setting is a valid relative path.`);
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake command cannot be reached.',
    () => {
      const provider = new DecorationLocationsProvider({
        workspace: buildFakeOverridableWorkspace({ cmakeCommand: '' }),
        statFile: buildSucceedingFakeStatFile(),
        processForCmakeCommand: buildFakeFailingProcess(),
        processForCmakeTarget: buildFakeFailingProcess(),
        globSearch: buildFakeGlobSearchForNoMatch(),
        fs: buildFakeFailingFs()
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions().should.eventually.be.rejectedWith(
        `Cannot find the cmake command. Ensure the '${extensionName}: Cmake Command' ` +
        'setting is correctly set. Have you verified your PATH environment variable?');
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake target cannot be built by cmake though the cmake command is invocable and ' +
    'the build tree directory exists.',
    () => {
      const workspace = buildFakeOverridableWorkspace({ cmakeTarget: '' });
      const target = workspace.getConfiguration('cmake-llvm-workspace').get('cmakeTarget');

      const provider = new DecorationLocationsProvider({
        workspace: workspace,
        statFile: buildSucceedingFakeStatFile(),
        processForCmakeCommand: buildFakeSucceedingProcess(),
        processForCmakeTarget: buildFakeFailingProcess(),
        globSearch: buildFakeGlobSearchForNoMatch(),
        fs: buildFakeFailingFs()
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions().should.eventually.be.rejectedWith(
        `Error: Could not build the specified cmake target ${target}. ` +
        `Ensure '${extensionName}: Cmake Target' setting is properly set.`);
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the coverage info file name does not target an existing file',
    () => {
      const provider = new DecorationLocationsProvider({
        workspace: buildFakeOverridableWorkspace({ coverageInfoFileName: 'baadf00d' }),
        statFile: buildSucceedingFakeStatFile(),
        processForCmakeCommand: buildFakeSucceedingProcess(),
        processForCmakeTarget: buildFakeSucceedingProcess(),
        globSearch: buildFakeGlobSearchForNoMatch(),
        fs: buildFakeFailingFs()
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions().should.eventually.be.rejectedWith(
        'Cannot resolve the coverage info file path in the build tree directory. ' +
        'Ensure that both ' +
        `'${extensionName}: Build Tree Directory' and '${extensionName}: Coverage Info File Name' ` +
        'settings are correctly set.');
    });
});
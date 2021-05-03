import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import { DecorationLocationsProvider } from '../../../src/domain/services/decoration-locations-provider';

import { process, statFile, workspace, glob } from '../../builders/fake-adapters';

import buildFakeProcess = process.buildFakeProcess;
import buildSucceedingFakeStatFile = statFile.buildSucceedingFakeStatFile;
import buildFailingFakeStatFile = statFile.buildFailingFakeStatFile;
import buildFakedVscodeWorkspaceWithoutWorkspaceFolderAndWithoutSettings = workspace.buildFakedVscodeWorkspaceWithoutWorkspaceFolderAndWithoutSettings;
import buildFakeOverridableWorkspace = workspace.buildFakedVscodeWorkspaceWithWorkspaceFolderAndWithOverridableDefaultSettings;
import buildFakeGlobSearch = glob.buildFakeGlobSearch;

describe('DecorationLocationProvider service behavior.', () => {
  it('should be correctly instantiated with faked adapters.', () => {
    const instantiation = () => {
      new DecorationLocationsProvider({
        workspace: buildFakedVscodeWorkspaceWithoutWorkspaceFolderAndWithoutSettings(),
        statFile: buildFailingFakeStatFile(),
        process: buildFakeProcess(),
        globSearch: buildFakeGlobSearch()
      });
    };

    instantiation.should.not.throw();
  });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the build tree directory can not be found though cmake command ' +
    'is invocable',
    () => {
      const provider = new DecorationLocationsProvider({
        workspace: buildFakeOverridableWorkspace(),
        statFile: buildFailingFakeStatFile(),
        process: buildFakeProcess(),
        globSearch: buildFakeGlobSearch()
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions().should.eventually.be.rejectedWith(
        "Cannot find the build tree directory. Ensure the 'cmake-llvm-coverage: Build Tree Directory' " +
        'setting is correctly set and target to an existing cmake build tree directory.');
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake command cannot be reached.',
    () => {
      const provider = new DecorationLocationsProvider({
        workspace: buildFakeOverridableWorkspace({ cmakeCommand: '' }),
        statFile: buildSucceedingFakeStatFile(),
        process: buildFakeProcess(),
        globSearch: buildFakeGlobSearch()
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions().should.eventually.be.rejectedWith(
        "Cannot find the cmake command. Ensure the 'cmake-llvm-coverage: Cmake Command' " +
        'setting is correctly set. Have you verified your PATH environment variable?');
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake target cannot be run by cmake though the cmake command is invocable and ' +
    'the build tree directory exists.',
    () => {
      const workspace = buildFakeOverridableWorkspace({ cmakeTarget: '' });
      const target = workspace.getConfiguration('cmake-llvm-workspace').get('cmakeTarget');

      const provider = new DecorationLocationsProvider({
        workspace: workspace,
        statFile: buildSucceedingFakeStatFile(),
        process: buildFakeProcess(),
        globSearch: buildFakeGlobSearch()
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions().should.eventually.be.rejectedWith(
        `Cannot build the cmake target: '${target}'. Make sure the ` +
        "'cmake-llvm-coverage: Cmake Target' setting is correctly set.");
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the coverage info file name does not target an existing file',
    () => {
      const provider = new DecorationLocationsProvider({
        workspace: buildFakeOverridableWorkspace({ coverageInfoFileName: '' }),
        statFile: buildSucceedingFakeStatFile(),
        process: buildFakeProcess(),
        globSearch: buildFakeGlobSearch()
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions().should.eventually.be.rejectedWith(
        'Error: Could not find the file containing coverage information. ' +
        'Ensure \'cmake-llvm-coverage Cmake Target\' and/or \'cmake-llvm-coverage Coverage Info File Name\' ' +
        'settings are properly set.');
    });

  // it('should be able to provide decoration for uncovered code regions ' +
  //   'when all adapters work as expected.',
  //   () => {
  //     const cmakeProcess = buildSucceedingCmakeProcess();
  //     const buildDirectoryResolver = buildSucceedingBuildTreeDirectoryResolver();
  //     const failingCoverageInfoFileResolver = buildSucceedingUncoveredCodeRegionsCollector();

  //     const provider = new DecorationLocationsProvider(cmakeProcess, buildDirectoryResolver, failingCoverageInfoFileResolver);

  //     return provider.getDecorationLocationsForUncoveredCodeRegions().should.eventually.be.fulfilled;
  //   });
});
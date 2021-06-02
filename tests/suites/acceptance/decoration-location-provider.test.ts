import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import { extensionName } from '../../../src/extension-name';
import { DecorationLocationsProvider } from '../../../src/domain/services/decoration-locations-provider';

import { process, statFile, workspace, glob, fs, stream } from '../../builders/fake-adapters';

// TODO: refacto that
import buildFakeFailingProcess = process.buildFakeFailingProcess;
import buildFakeSucceedingProcess = process.buildFakeSucceedingProcess;
import buildSucceedingFakeStatFile = statFile.buildFakeSucceedingStatFile;
import buildFakeFailingStatFile = statFile.buildFakeFailingStatFile;
import buildFakedVscodeWorkspaceWithoutWorkspaceFolderAndWithoutSettings = workspace.buildFakeWorkspaceWithoutWorkspaceFolderAndWithoutSettings;
import buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings = workspace.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings;
import buildFakeGlobSearchForNoMatch = glob.buildFakeGlobSearchForNoMatch;
import buildFakeGlobSearchForSeveralMatch = glob.buildFakeGlobSearchForSeveralMatch;
import buildFakeGlobSearchForExactlyOneMatch = glob.buildFakeGlobSearchForExactlyOneMatch;
import buildFakeFailingFs = fs.buildFakeFailingFs;
import buildFakeSucceedingFs = fs.buildFakeSucceedingFs;
import buildFakeStreamBuilder = stream.buildFakeStreamBuilder;
import buildEmptyReadableStream = stream.buildEmptyReadableStream;
import buildNotJsonStream = stream.buildNotJsonStream;
import buildValidLlvmCoverageJsonObjectStream = stream.buildValidLlvmCoverageJsonObjectStream;

describe('DecorationLocationProvider service behavior.', () => {
  it('should be correctly instantiated with faked adapters.', () => {
    const instantiation = () => {
      new DecorationLocationsProvider({
        workspace: buildFakedVscodeWorkspaceWithoutWorkspaceFolderAndWithoutSettings(),
        statFile: buildFakeFailingStatFile(),
        processForCmakeCommand: buildFakeFailingProcess(),
        processForCmakeTarget: buildFakeFailingProcess(),
        globSearch: buildFakeGlobSearchForNoMatch(),
        fs: buildFakeFailingFs(),
        streamBuilder: buildFakeStreamBuilder(buildEmptyReadableStream),
      });
    };

    instantiation.should.not.throw();
  });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the build tree directory can not be found and / or created though cmake command ' +
    'is invocable',
    () => {
      const provider = new DecorationLocationsProvider({
        workspace: buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
        statFile: buildFakeFailingStatFile(),
        processForCmakeCommand: buildFakeFailingProcess(),
        processForCmakeTarget: buildFakeFailingProcess(),
        globSearch: buildFakeGlobSearchForNoMatch(),
        fs: buildFakeFailingFs(),
        streamBuilder: buildFakeStreamBuilder(buildEmptyReadableStream),
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        'Cannot find or create the build tree directory. Ensure the ' +
        `'${extensionName}: Build Tree Directory' setting is a valid relative path.`);
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake command cannot be reached.',
    () => {
      const provider = new DecorationLocationsProvider({
        workspace: buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ cmakeCommand: '' }),
        statFile: buildSucceedingFakeStatFile(),
        processForCmakeCommand: buildFakeFailingProcess(),
        processForCmakeTarget: buildFakeFailingProcess(),
        globSearch: buildFakeGlobSearchForNoMatch(),
        fs: buildFakeFailingFs(),
        streamBuilder: buildFakeStreamBuilder(buildEmptyReadableStream),
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        `Cannot find the cmake command. Ensure the '${extensionName}: Cmake Command' ` +
        'setting is correctly set. Have you verified your PATH environment variable?');
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake target cannot be built by cmake though the cmake command is invocable and ' +
    'the build tree directory exists.',
    () => {
      const workspace = buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ cmakeTarget: '' });
      const target = workspace.getConfiguration('cmake-llvm-workspace').get('cmakeTarget');

      const provider = new DecorationLocationsProvider({
        workspace: workspace,
        statFile: buildSucceedingFakeStatFile(),
        processForCmakeCommand: buildFakeSucceedingProcess(),
        processForCmakeTarget: buildFakeFailingProcess(),
        globSearch: buildFakeGlobSearchForNoMatch(),
        fs: buildFakeFailingFs(),
        streamBuilder: buildFakeStreamBuilder(buildEmptyReadableStream),
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        `Error: Could not build the specified cmake target ${target}. ` +
        `Ensure '${extensionName}: Cmake Target' setting is properly set.`);
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the coverage info file name does not target an existing file',
    () => {
      const provider = new DecorationLocationsProvider({
        workspace: buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ coverageInfoFileName: 'baadf00d' }),
        statFile: buildSucceedingFakeStatFile(),
        processForCmakeCommand: buildFakeSucceedingProcess(),
        processForCmakeTarget: buildFakeSucceedingProcess(),
        globSearch: buildFakeGlobSearchForNoMatch(),
        fs: buildFakeFailingFs(),
        streamBuilder: buildFakeStreamBuilder(buildEmptyReadableStream),
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        'Cannot resolve the coverage info file path in the build tree directory. ' +
        'Ensure that both ' +
        `'${extensionName}: Build Tree Directory' and '${extensionName}: Coverage Info File Name' ` +
        'settings are correctly set.');
    });

  it('should not not able to provide any decoration for uncovered code regions ' +
    'when there are more than one generated coverage information file that are found', () => {
      const provider = new DecorationLocationsProvider({
        workspace: buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
        statFile: buildSucceedingFakeStatFile(),
        processForCmakeCommand: buildFakeSucceedingProcess(),
        processForCmakeTarget: buildFakeSucceedingProcess(),
        globSearch: buildFakeGlobSearchForSeveralMatch(),
        fs: buildFakeFailingFs(),
        streamBuilder: buildFakeStreamBuilder(buildEmptyReadableStream),
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        'More than one coverage information file have been found in the build tree directory. ' +
        'Ensure that both ' +
        `'${extensionName}: Build Tree Directory' and '${extensionName}: Coverage Info File Name' ` +
        'settings are correctly set.');
    });

  describe.skip('the behavior of the coverage info collection with valid minimal json document', () => {
    it('should succed to collect coverage information for the requested file', () => {
      const provider = new DecorationLocationsProvider({
        workspace: buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
        statFile: buildSucceedingFakeStatFile(),
        processForCmakeCommand: buildFakeSucceedingProcess(),
        processForCmakeTarget: buildFakeSucceedingProcess(),
        globSearch: buildFakeGlobSearchForExactlyOneMatch(),
        fs: buildFakeSucceedingFs(),
        streamBuilder: buildFakeStreamBuilder(buildValidLlvmCoverageJsonObjectStream)
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('/a/source/file.cpp')
        .should.eventually.be.not.null;
    });
  });
});


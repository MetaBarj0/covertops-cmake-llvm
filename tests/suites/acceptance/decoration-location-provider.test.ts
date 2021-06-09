import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as definitions from '../../../src/definitions';
import { DecorationLocationsProvider } from '../../../src/domain/services/decoration-locations-provider';
import { RegionCoverageInfo } from '../../../src/domain/value-objects/region-coverage-info';

import { fs } from '../../faked-adapters/fs';
import { vscodeWorkspace as v } from '../../faked-adapters/vscode-workspace';
import { process as p } from '../../faked-adapters/process';
import { inputStream as i } from '../../faked-adapters/input-stream';
import { statFile as sf } from '../../faked-adapters/stat-file';
import { globbing as g } from '../../faked-adapters/globbing';

describe('acceptance suite of tests', () => {
  describe('The decoration location provider service behavior', () => {
    describe('The service being instantiated with faked adapters', instantiateService);
    describe('The service failing with incorrect settings', () => {
      describe('When issues arise with the build tree directory', failBecauseOfIssuesWithBuildTreeDirectorySetting);
      describe('When issues arise with the cmake command', failBecauseOfIssuesWithCmakeCommandSetting);
      describe('When issues arise with the cmake target', failBecauseOfIssuesWithCmakeTargetSetting);
      describe('When issues arise with the coverage info file name', () => {
        describe('When the coverage info file is not found', failBecauseCoverageInfoFileIsNotFound);
        describe('When several coverage info file are found', failBecauseSeveralCoverageInfoFileAreFound);
      });
    });
    describe('The service succeding with correct settings and fake adapters', succeedWithCorrectSettingsAndFakeAdapters);
  });
});

function instantiateService() {
  it('should be correctly instantiated with faked adapters.', () => {
    const instantiation = () => {
      new DecorationLocationsProvider({
        workspace: v.buildFakeWorkspaceWithoutWorkspaceFolderAndWithoutSettings(),
        statFile: sf.buildFakeFailingStatFile(),
        processForCmakeCommand: p.buildFakeFailingProcess(),
        processForCmakeTarget: p.buildFakeFailingProcess(),
        globSearch: g.buildFakeGlobSearchForNoMatch(),
        fs: fs.buildFakeFailingFs(),
        llvmCoverageInfoStreamBuilder: i.buildFakeStreamBuilder(i.buildEmptyReadableStream),
      });
    };

    instantiation.should.not.throw();
  });
}

function failBecauseOfIssuesWithBuildTreeDirectorySetting() {
  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the build tree directory can not be found and / or created though cmake command ' +
    'is invocable', () => {
      const provider = new DecorationLocationsProvider({
        workspace: v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
        statFile: sf.buildFakeFailingStatFile(),
        processForCmakeCommand: p.buildFakeFailingProcess(),
        processForCmakeTarget: p.buildFakeFailingProcess(),
        globSearch: g.buildFakeGlobSearchForNoMatch(),
        fs: fs.buildFakeFailingFs(),
        llvmCoverageInfoStreamBuilder: i.buildFakeStreamBuilder(i.buildEmptyReadableStream),
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        'Cannot find or create the build tree directory. Ensure the ' +
        `'${definitions.extensionNameInSettings}: Build Tree Directory' setting is a valid relative path.`);
    });
}

function failBecauseOfIssuesWithCmakeCommandSetting() {
  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake command cannot be reached.', () => {
      const provider = new DecorationLocationsProvider({
        workspace: v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ cmakeCommand: '' }),
        statFile: sf.buildFakeSucceedingStatFile(),
        processForCmakeCommand: p.buildFakeFailingProcess(),
        processForCmakeTarget: p.buildFakeFailingProcess(),
        globSearch: g.buildFakeGlobSearchForNoMatch(),
        fs: fs.buildFakeFailingFs(),
        llvmCoverageInfoStreamBuilder: i.buildFakeStreamBuilder(i.buildEmptyReadableStream),
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        `Cannot find the cmake command. Ensure the '${definitions.extensionNameInSettings}: Cmake Command' ` +
        'setting is correctly set. Have you verified your PATH environment variable?');
    });
}

// TODO: work sentences of test cases
function failBecauseOfIssuesWithCmakeTargetSetting() {
  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake target cannot be built by cmake though the cmake command is invocable and ' +
    'the build tree directory exists.', () => {
      const workspace = v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ cmakeTarget: '' });
      const target = workspace.getConfiguration('cmake-llvm-workspace').get('cmakeTarget');

      const provider = new DecorationLocationsProvider({
        workspace,
        statFile: sf.buildFakeSucceedingStatFile(),
        processForCmakeCommand: p.buildFakeSucceedingProcess(),
        processForCmakeTarget: p.buildFakeFailingProcess(),
        globSearch: g.buildFakeGlobSearchForNoMatch(),
        fs: fs.buildFakeFailingFs(),
        llvmCoverageInfoStreamBuilder: i.buildFakeStreamBuilder(i.buildEmptyReadableStream),
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        `Error: Could not build the specified cmake target ${target}. ` +
        `Ensure '${definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`);
    });
}

function failBecauseCoverageInfoFileIsNotFound() {
  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the coverage info file name does not target an existing file', () => {
      const provider = new DecorationLocationsProvider({
        workspace: v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ coverageInfoFileName: 'baadf00d' }),
        statFile: sf.buildFakeSucceedingStatFile(),
        processForCmakeCommand: p.buildFakeSucceedingProcess(),
        processForCmakeTarget: p.buildFakeSucceedingProcess(),
        globSearch: g.buildFakeGlobSearchForNoMatch(),
        fs: fs.buildFakeFailingFs(),
        llvmCoverageInfoStreamBuilder: i.buildFakeStreamBuilder(i.buildEmptyReadableStream),
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        'Cannot resolve the coverage info file path in the build tree directory. ' +
        'Ensure that both ' +
        `'${definitions.extensionNameInSettings}: Build Tree Directory' and ` +
        `'${definitions.extensionNameInSettings}: Coverage Info File Name' ` +
        'settings are correctly set.');
    });
}

function failBecauseSeveralCoverageInfoFileAreFound() {
  it('should not not able to provide any decoration for uncovered code regions ' +
    'when there are more than one generated coverage information file that are found', () => {
      const provider = new DecorationLocationsProvider({
        workspace: v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
        statFile: sf.buildFakeSucceedingStatFile(),
        processForCmakeCommand: p.buildFakeSucceedingProcess(),
        processForCmakeTarget: p.buildFakeSucceedingProcess(),
        globSearch: g.buildFakeGlobSearchForSeveralMatch(),
        fs: fs.buildFakeFailingFs(),
        llvmCoverageInfoStreamBuilder: i.buildFakeStreamBuilder(i.buildEmptyReadableStream),
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        'More than one coverage information file have been found in the build tree directory. ' +
        'Ensure that both ' +
        `'${definitions.extensionNameInSettings}: Build Tree Directory' and ` +
        `'${definitions.extensionNameInSettings}: Coverage Info File Name' ` +
        'settings are correctly set.');
    });
}

function succeedWithCorrectSettingsAndFakeAdapters() {
  it('should succed to collect coverage information for the requested file', async () => {
    const provider = new DecorationLocationsProvider({
      workspace: v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
      statFile: sf.buildFakeSucceedingStatFile(),
      processForCmakeCommand: p.buildFakeSucceedingProcess(),
      processForCmakeTarget: p.buildFakeSucceedingProcess(),
      globSearch: g.buildFakeGlobSearchForExactlyOneMatch(),
      fs: fs.buildFakeSucceedingFs(),
      llvmCoverageInfoStreamBuilder: i.buildFakeStreamBuilder(i.buildValidLlvmCoverageJsonObjectStream)
    });

    const decorations = await provider.getDecorationLocationsForUncoveredCodeRegions('/a/source/file.cpp');

    const uncoveredRegions: Array<RegionCoverageInfo> = [];
    for await (const region of decorations.uncoveredRegions())
      uncoveredRegions.push(region);

    const summary = await decorations.summary;

    summary.should.be.deep.equal({
      count: 2,
      covered: 2,
      notCovered: 0,
      percent: 100
    });

    uncoveredRegions.length.should.be.equal(1);
    uncoveredRegions[0].range.should.be.deep.equal({
      start: {
        line: 6,
        character: 53
      },
      end: {
        line: 6,
        character: 71
      }
    });
  });
}
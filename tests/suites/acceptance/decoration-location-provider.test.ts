import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as Definitions from '../../../src/extension/definitions';
import * as DecorationLocationsProvider from '../../../src/modules/decoration-locations-provider/domain/implementations/decoration-locations-provider';
import * as SettingsProvider from '../../../src/modules/settings-provider/domain/implementations/settings-provider';
import * as BuildTreeDirectoryResolver from '../../../src/modules/build-tree-directory-resolver/domain/implementations/build-tree-directory-resolver';
// TODO: Global - rename 'domain' folder of module 'implementations'
import * as Cmake from '../../../src/modules/cmake/domain/implementations/cmake';
import * as CoverageInfoCollector from '../../../src/modules/coverage-info-collector/domain/implementations/coverage-info-collector';

import { RegionCoverageInfo } from '../../../src/modules/coverage-info-collector/domain/abstractions/region-coverage-info';

// TODO: refacto adapter fakes to be the mirroring of the adapter structure
import { mkDir } from '../../fakes/adapters/mk-dir';
import * as vscode from '../../fakes/adapters/vscode';
import { process as p } from '../../fakes/adapters/process-control';
import { inputStream as i } from '../../fakes/adapters/input-stream';
import { statFile as sf } from '../../fakes/adapters/stat-file';
import { globbing as g } from '../../fakes/adapters/globbing';
import { progressReporter as pr } from '../../fakes/adapters/progress-reporter';
import { errorChannel as e } from '../../fakes/adapters/error-channel';

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
  it('should not throw when instantiated with faked adapters.', () => {
    const workspace = vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const errorChannel = e.buildFakeErrorChannel();
    const settings = SettingsProvider.make({ errorChannel, workspace }).settings;
    const progressReporter = pr.buildFakeProgressReporter();
    const mkdir = mkDir.buildFakeFailingMkDir();
    const stat = sf.buildFakeFailingStatFile();
    const buildTreeDirectoryResolver = BuildTreeDirectoryResolver.make({ errorChannel, settings, mkdir, stat, progressReporter });
    const execFileForCommand = p.buildFakeFailingProcess();
    const execFileForTarget = p.buildFakeFailingProcess();
    const cmake = Cmake.make({
      settings,
      processControl: { execFileForCommand, execFileForTarget },
      vscode: { errorChannel, progressReporter }
    });
    const globSearch = g.buildFakeGlobSearchForNoMatch();
    const createReadStream = i.buildFakeStreamBuilder(i.buildEmptyReadableStream);
    const coverageInfoCollector = CoverageInfoCollector.make({ createReadStream, globSearch, errorChannel, progressReporter, settings });

    const instantiation = () => {
      DecorationLocationsProvider.make({
        settings,
        buildTreeDirectoryResolver,
        cmake,
        coverageInfoCollector
      });
    };

    instantiation.should.not.throw();
  });
}

function failBecauseOfIssuesWithBuildTreeDirectorySetting() {
  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the build tree directory can not be found and / or created', () => {
      const errorChannel = e.buildFakeErrorChannel();
      const workspace = vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
      const settings = SettingsProvider.make({ errorChannel, workspace }).settings;
      const progressReporter = pr.buildFakeProgressReporter();
      const mkdir = mkDir.buildFakeFailingMkDir();
      const stat = sf.buildFakeFailingStatFile();
      const buildTreeDirectoryResolver = BuildTreeDirectoryResolver.make({ errorChannel, settings, mkdir, stat, progressReporter });
      const execFileForCommand = p.buildFakeFailingProcess();
      const execFileForTarget = p.buildFakeFailingProcess();
      const cmake = Cmake.make({
        settings,
        processControl: { execFileForCommand, execFileForTarget },
        vscode: { errorChannel, progressReporter }
      });
      const globSearch = g.buildFakeGlobSearchForNoMatch();
      const createReadStream = i.buildFakeStreamBuilder(i.buildEmptyReadableStream);
      const coverageInfoCollector = CoverageInfoCollector.make({ createReadStream, globSearch, errorChannel, progressReporter, settings });

      const provider = DecorationLocationsProvider.make({
        settings,
        buildTreeDirectoryResolver,
        cmake,
        coverageInfoCollector
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        'Cannot find or create the build tree directory. Ensure the ' +
        `'${Definitions.extensionNameInSettings}: Build Tree Directory' setting is a valid relative path.`);
    });
}

function failBecauseOfIssuesWithCmakeCommandSetting() {
  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake command cannot be reached.', () => {
      const errorChannel = e.buildFakeErrorChannel();
      const workspace = vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ cmakeCommand: '' });
      const settings = SettingsProvider.make({ errorChannel, workspace }).settings;
      const progressReporter = pr.buildFakeProgressReporter();
      const mkdir = mkDir.buildFakeFailingMkDir();
      const stat = sf.buildFakeSucceedingStatFile();
      const buildTreeDirectoryResolver = BuildTreeDirectoryResolver.make({ errorChannel, settings, mkdir, stat, progressReporter });
      const execFileForCommand = p.buildFakeFailingProcess();
      const execFileForTarget = p.buildFakeFailingProcess();
      const cmake = Cmake.make({
        settings,
        processControl: { execFileForCommand, execFileForTarget },
        vscode: { errorChannel, progressReporter }
      });
      const globSearch = g.buildFakeGlobSearchForNoMatch();
      const createReadStream = i.buildFakeStreamBuilder(i.buildEmptyReadableStream);
      const coverageInfoCollector = CoverageInfoCollector.make({ createReadStream, globSearch, errorChannel, progressReporter, settings });

      const provider = DecorationLocationsProvider.make({
        settings,
        buildTreeDirectoryResolver,
        cmake,
        coverageInfoCollector
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        `Cannot find the cmake command. Ensure the '${Definitions.extensionNameInSettings}: Cmake Command' ` +
        'setting is correctly set. Have you verified your PATH environment variable?');
    });
}

// TODO: File - remove arrange sections duplications
function failBecauseOfIssuesWithCmakeTargetSetting() {
  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake target cannot be built', () => {
      const workspace = vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ cmakeTarget: '' });
      const errorChannel = e.buildFakeErrorChannel();
      const settings = SettingsProvider.make({ errorChannel, workspace }).settings;
      const target = workspace.getConfiguration(Definitions.extensionId).get('cmakeTarget');
      const progressReporter = pr.buildFakeProgressReporter();
      const mkdir = mkDir.buildFakeFailingMkDir();
      const stat = sf.buildFakeSucceedingStatFile();
      const buildTreeDirectoryResolver = BuildTreeDirectoryResolver.make({ errorChannel, settings, mkdir, stat, progressReporter });
      const execFileForCommand = p.buildFakeSucceedingProcess();
      const execFileForTarget = p.buildFakeFailingProcess();
      const cmake = Cmake.make({
        settings,
        processControl: { execFileForCommand, execFileForTarget },
        vscode: { errorChannel, progressReporter }
      });
      const globSearch = g.buildFakeGlobSearchForNoMatch();
      const createReadStream = i.buildFakeStreamBuilder(i.buildEmptyReadableStream);
      const coverageInfoCollector = CoverageInfoCollector.make({ createReadStream, globSearch, errorChannel, progressReporter, settings });

      const provider = DecorationLocationsProvider.make({
        settings,
        buildTreeDirectoryResolver,
        cmake,
        coverageInfoCollector
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        `Error: Could not build the specified cmake target ${target}. ` +
        `Ensure '${Definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`);
    });
}

function failBecauseCoverageInfoFileIsNotFound() {
  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the coverage info file name cannot be found', () => {
      const errorChannel = e.buildFakeErrorChannel();
      const workspace = vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ coverageInfoFileName: 'baadf00d' });
      const settings = SettingsProvider.make({ errorChannel, workspace }).settings;
      const progressReporter = pr.buildFakeProgressReporter();
      const mkdir = mkDir.buildFakeFailingMkDir();
      const stat = sf.buildFakeSucceedingStatFile();
      const buildTreeDirectoryResolver = BuildTreeDirectoryResolver.make({ errorChannel, settings, mkdir, stat, progressReporter });
      const execFileForCommand = p.buildFakeSucceedingProcess();
      const execFileForTarget = p.buildFakeSucceedingProcess();
      const cmake = Cmake.make({
        settings,
        processControl: { execFileForCommand, execFileForTarget },
        vscode: { errorChannel, progressReporter }
      });
      const globSearch = g.buildFakeGlobSearchForNoMatch();
      const createReadStream = i.buildFakeStreamBuilder(i.buildEmptyReadableStream);
      const coverageInfoCollector = CoverageInfoCollector.make({ createReadStream, globSearch, errorChannel, progressReporter, settings });

      const provider = DecorationLocationsProvider.make({
        settings,
        buildTreeDirectoryResolver,
        cmake,
        coverageInfoCollector
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        'Cannot resolve the coverage info file path in the build tree directory. ' +
        'Ensure that both ' +
        `'${Definitions.extensionNameInSettings}: Build Tree Directory' and ` +
        `'${Definitions.extensionNameInSettings}: Coverage Info File Name' ` +
        'settings are correctly set.');
    });
}

function failBecauseSeveralCoverageInfoFileAreFound() {
  it('should not not able to provide any decoration for uncovered code regions ' +
    'when there are more than one generated coverage information file that are found', () => {
      const errorChannel = e.buildFakeErrorChannel();
      const workspace = vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
      const settings = SettingsProvider.make({ errorChannel, workspace }).settings;
      const progressReporter = pr.buildFakeProgressReporter();
      const mkdir = mkDir.buildFakeFailingMkDir();
      const stat = sf.buildFakeSucceedingStatFile();
      const buildTreeDirectoryResolver = BuildTreeDirectoryResolver.make({ errorChannel, settings, mkdir, stat, progressReporter });
      const execFileForCommand = p.buildFakeSucceedingProcess();
      const execFileForTarget = p.buildFakeSucceedingProcess();
      const cmake = Cmake.make({
        settings,
        processControl: { execFileForCommand, execFileForTarget },
        vscode: { errorChannel, progressReporter }
      });
      const globSearch = g.buildFakeGlobSearchForSeveralMatch();
      const createReadStream = i.buildFakeStreamBuilder(i.buildEmptyReadableStream);
      const coverageInfoCollector = CoverageInfoCollector.make({ createReadStream, globSearch, errorChannel, progressReporter, settings });

      const provider = DecorationLocationsProvider.make({
        settings,
        buildTreeDirectoryResolver,
        cmake,
        coverageInfoCollector
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        'More than one coverage information file have been found in the build tree directory. ' +
        'Ensure that both ' +
        `'${Definitions.extensionNameInSettings}: Build Tree Directory' and ` +
        `'${Definitions.extensionNameInSettings}: Coverage Info File Name' ` +
        'settings are correctly set.');
    });
}

// TODO: File - duplication in arrange sections
function succeedWithCorrectSettingsAndFakeAdapters() {
  it('should succed to collect correct coverage information for the requested file in x discrete steps.', async () => {
    const progressReporterSpy = pr.buildSpyOfProgressReporter(pr.buildFakeProgressReporter());
    const errorChannel = e.buildFakeErrorChannel();
    const workspace = vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const settings = SettingsProvider.make({ errorChannel, workspace }).settings;
    const progressReporter = progressReporterSpy.object;
    const mkdir = mkDir.buildFakeSucceedingMkDir();
    const stat = sf.buildFakeSucceedingStatFile();
    const buildTreeDirectoryResolver = BuildTreeDirectoryResolver.make({ errorChannel, settings, mkdir, stat, progressReporter });
    const execFileForCommand = p.buildFakeSucceedingProcess();
    const execFileForTarget = p.buildFakeSucceedingProcess();
    const cmake = Cmake.make({
      settings,
      processControl: { execFileForCommand, execFileForTarget },
      vscode: { errorChannel, progressReporter }
    });
    const globSearch = g.buildFakeGlobSearchForExactlyOneMatch();
    const createReadStream = i.buildFakeStreamBuilder(i.buildValidLlvmCoverageJsonObjectStream);
    const coverageInfoCollector = CoverageInfoCollector.make({ createReadStream, globSearch, errorChannel, progressReporter, settings });

    const provider = DecorationLocationsProvider.make({
      settings,
      buildTreeDirectoryResolver,
      cmake,
      coverageInfoCollector
    });

    const decorations = await provider.getDecorationLocationsForUncoveredCodeRegions('/a/source/file.cpp');

    const uncoveredRegions: Array<RegionCoverageInfo> = [];
    for await (const region of decorations.uncoveredRegions)
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

    progressReporterSpy.countFor('report').should.be.equal(6);
  });
}
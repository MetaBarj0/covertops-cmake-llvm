import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as Imports from './imports';

describe('acceptance suite of tests', () => {
  describe('The decoration location provider service behavior', () => {
    describe('The service being instantiated with faked adapters', instantiateService);
    describe('The service failing with incorrect settings', () => {
      describe('When issues arise with the build tree directory', failBecauseOfIssuesWithBuildTreeDirectorySetting);
      describe('When issues arise with the cmake command reachability', failBecauseOfIssuesWithCmakeCommandSetting);
      describe('When issues arise with the cmake target build', failBecauseOfIssuesWithCmakeTargetSetting);
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
    const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const errorChannel = Imports.Fakes.Adapters.vscode.buildFakeErrorChannel();
    const settings = Imports.Domain.Implementations.SettingsProvider.make({ errorChannel, workspace }).settings;
    const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();
    const mkdir = Imports.Fakes.Adapters.FileSystem.buildFakeFailingMkDir();
    const stat = Imports.Fakes.Adapters.FileSystem.buildFakeFailingStatFile();
    const buildTreeDirectoryResolver = Imports.Domain.Implementations.BuildTreeDirectoryResolver.make({ errorChannel, settings, mkdir, stat, progressReporter });
    const execFileForCommand = Imports.Fakes.Adapters.ProcessControl.buildFakeFailingProcess();
    const execFileForTarget = Imports.Fakes.Adapters.ProcessControl.buildFakeFailingProcess();
    const cmake = Imports.Domain.Implementations.Cmake.make({
      settings,
      execFileForCommand,
      execFileForTarget,
      errorChannel,
      progressReporter
    });
    const globSearch = Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForNoMatch();
    const createReadStream = Imports.Fakes.Adapters.FileSystem.buildFakeStreamBuilder(Imports.Fakes.Adapters.FileSystem.buildEmptyReadableStream);
    const coverageInfoCollector = Imports.Domain.Implementations.CoverageInfoCollector.make({ createReadStream, globSearch, errorChannel, progressReporter, settings });

    const instantiation = () => {
      Imports.Domain.Implementations.DecorationLocationsProvider.make({
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
      const errorChannel = Imports.Fakes.Adapters.vscode.buildFakeErrorChannel();
      const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
      const settings = Imports.Domain.Implementations.SettingsProvider.make({ errorChannel, workspace }).settings;
      const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();
      const mkdir = Imports.Fakes.Adapters.FileSystem.buildFakeFailingMkDir();
      const stat = Imports.Fakes.Adapters.FileSystem.buildFakeFailingStatFile();
      const buildTreeDirectoryResolver = Imports.Domain.Implementations.BuildTreeDirectoryResolver.make({ errorChannel, settings, mkdir, stat, progressReporter });
      const execFileForCommand = Imports.Fakes.Adapters.ProcessControl.buildFakeFailingProcess();
      const execFileForTarget = Imports.Fakes.Adapters.ProcessControl.buildFakeFailingProcess();
      const cmake = Imports.Domain.Implementations.Cmake.make({
        settings,
        execFileForCommand,
        execFileForTarget,
        errorChannel,
        progressReporter
      });
      const globSearch = Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForNoMatch();
      const createReadStream = Imports.Fakes.Adapters.FileSystem.buildFakeStreamBuilder(Imports.Fakes.Adapters.FileSystem.buildEmptyReadableStream);
      const coverageInfoCollector = Imports.Domain.Implementations.CoverageInfoCollector.make({ createReadStream, globSearch, errorChannel, progressReporter, settings });

      const provider = Imports.Domain.Implementations.DecorationLocationsProvider.make({
        settings,
        buildTreeDirectoryResolver,
        cmake,
        coverageInfoCollector
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        'Cannot find or create the build tree directory. Ensure the ' +
        `'${Imports.Extension.Definitions.extensionNameInSettings}: Build Tree Directory' setting is a valid relative path.`);
    });
}

function failBecauseOfIssuesWithCmakeCommandSetting() {
  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake command cannot be reached.', () => {
      const errorChannel = Imports.Fakes.Adapters.vscode.buildFakeErrorChannel();
      const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ cmakeCommand: '' });
      const settings = Imports.Domain.Implementations.SettingsProvider.make({ errorChannel, workspace }).settings;
      const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();
      const mkdir = Imports.Fakes.Adapters.FileSystem.buildFakeFailingMkDir();
      const stat = Imports.Fakes.Adapters.FileSystem.buildFakeSucceedingStatFile();
      const buildTreeDirectoryResolver = Imports.Domain.Implementations.BuildTreeDirectoryResolver.make({ errorChannel, settings, mkdir, stat, progressReporter });
      const cmake = Imports.Fakes.Domain.buildUnreachableCmake();
      const globSearch = Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForNoMatch();
      const createReadStream = Imports.Fakes.Adapters.FileSystem.buildFakeStreamBuilder(Imports.Fakes.Adapters.FileSystem.buildEmptyReadableStream);
      const coverageInfoCollector = Imports.Domain.Implementations.CoverageInfoCollector.make({ createReadStream, globSearch, errorChannel, progressReporter, settings });

      const provider = Imports.Domain.Implementations.DecorationLocationsProvider.make({
        settings,
        buildTreeDirectoryResolver,
        cmake,
        coverageInfoCollector
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        `Cannot find the cmake command. Ensure the '${Imports.Extension.Definitions.extensionNameInSettings}: Cmake Command' ` +
        'setting is correctly set. Have you verified your PATH environment variable?');
    });
}

// TODO: File - remove arrange sections duplications
function failBecauseOfIssuesWithCmakeTargetSetting() {
  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake target cannot be built', () => {
      const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ cmakeTarget: '' });
      const errorChannel = Imports.Fakes.Adapters.vscode.buildFakeErrorChannel();
      const settings = Imports.Domain.Implementations.SettingsProvider.make({ errorChannel, workspace }).settings;
      const target = workspace.getConfiguration(Imports.Extension.Definitions.extensionId).get('cmakeTarget');
      const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();
      const mkdir = Imports.Fakes.Adapters.FileSystem.buildFakeFailingMkDir();
      const stat = Imports.Fakes.Adapters.FileSystem.buildFakeSucceedingStatFile();
      const buildTreeDirectoryResolver = Imports.Domain.Implementations.BuildTreeDirectoryResolver.make({ errorChannel, settings, mkdir, stat, progressReporter });
      const cmake = Imports.Fakes.Domain.buildCmakeFailingAtBuildingTarget();
      const globSearch = Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForNoMatch();
      const createReadStream = Imports.Fakes.Adapters.FileSystem.buildFakeStreamBuilder(Imports.Fakes.Adapters.FileSystem.buildEmptyReadableStream);
      const coverageInfoCollector = Imports.Domain.Implementations.CoverageInfoCollector.make({ createReadStream, globSearch, errorChannel, progressReporter, settings });

      const provider = Imports.Domain.Implementations.DecorationLocationsProvider.make({
        settings,
        buildTreeDirectoryResolver,
        cmake,
        coverageInfoCollector
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        `Error: Could not build the specified cmake target ${target}. ` +
        `Ensure '${Imports.Extension.Definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`);
    });
}

function failBecauseCoverageInfoFileIsNotFound() {
  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the coverage info file name cannot be found', () => {
      const errorChannel = Imports.Fakes.Adapters.vscode.buildFakeErrorChannel();
      const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ coverageInfoFileName: 'baadf00d' });
      const settings = Imports.Domain.Implementations.SettingsProvider.make({ errorChannel, workspace }).settings;
      const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();
      const mkdir = Imports.Fakes.Adapters.FileSystem.buildFakeFailingMkDir();
      const stat = Imports.Fakes.Adapters.FileSystem.buildFakeSucceedingStatFile();
      const buildTreeDirectoryResolver = Imports.Domain.Implementations.BuildTreeDirectoryResolver.make({ errorChannel, settings, mkdir, stat, progressReporter });
      const execFileForCommand = Imports.Fakes.Adapters.ProcessControl.buildFakeSucceedingProcess();
      const execFileForTarget = Imports.Fakes.Adapters.ProcessControl.buildFakeSucceedingProcess();
      const cmake = Imports.Domain.Implementations.Cmake.make({
        settings,
        execFileForCommand,
        execFileForTarget,
        errorChannel,
        progressReporter
      });
      const globSearch = Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForNoMatch();
      const createReadStream = Imports.Fakes.Adapters.FileSystem.buildFakeStreamBuilder(Imports.Fakes.Adapters.FileSystem.buildEmptyReadableStream);
      const coverageInfoCollector = Imports.Domain.Implementations.CoverageInfoCollector.make({ createReadStream, globSearch, errorChannel, progressReporter, settings });

      const provider = Imports.Domain.Implementations.DecorationLocationsProvider.make({
        settings,
        buildTreeDirectoryResolver,
        cmake,
        coverageInfoCollector
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        'Cannot resolve the coverage info file path in the build tree directory. ' +
        'Ensure that both ' +
        `'${Imports.Extension.Definitions.extensionNameInSettings}: Build Tree Directory' and ` +
        `'${Imports.Extension.Definitions.extensionNameInSettings}: Coverage Info File Name' ` +
        'settings are correctly set.');
    });
}

function failBecauseSeveralCoverageInfoFileAreFound() {
  it('should not not able to provide any decoration for uncovered code regions ' +
    'when there are more than one generated coverage information file that are found', () => {
      const errorChannel = Imports.Fakes.Adapters.vscode.buildFakeErrorChannel();
      const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
      const settings = Imports.Domain.Implementations.SettingsProvider.make({ errorChannel, workspace }).settings;
      const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();
      const mkdir = Imports.Fakes.Adapters.FileSystem.buildFakeFailingMkDir();
      const stat = Imports.Fakes.Adapters.FileSystem.buildFakeSucceedingStatFile();
      const buildTreeDirectoryResolver = Imports.Domain.Implementations.BuildTreeDirectoryResolver.make({ errorChannel, settings, mkdir, stat, progressReporter });
      const execFileForCommand = Imports.Fakes.Adapters.ProcessControl.buildFakeSucceedingProcess();
      const execFileForTarget = Imports.Fakes.Adapters.ProcessControl.buildFakeSucceedingProcess();
      const cmake = Imports.Domain.Implementations.Cmake.make({
        settings,
        execFileForCommand,
        execFileForTarget,
        errorChannel,
        progressReporter
      });
      const globSearch = Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForSeveralMatch();
      const createReadStream = Imports.Fakes.Adapters.FileSystem.buildFakeStreamBuilder(Imports.Fakes.Adapters.FileSystem.buildEmptyReadableStream);
      const coverageInfoCollector = Imports.Domain.Implementations.CoverageInfoCollector.make({ createReadStream, globSearch, errorChannel, progressReporter, settings });

      const provider = Imports.Domain.Implementations.DecorationLocationsProvider.make({
        settings,
        buildTreeDirectoryResolver,
        cmake,
        coverageInfoCollector
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        'More than one coverage information file have been found in the build tree directory. ' +
        'Ensure that both ' +
        `'${Imports.Extension.Definitions.extensionNameInSettings}: Build Tree Directory' and ` +
        `'${Imports.Extension.Definitions.extensionNameInSettings}: Coverage Info File Name' ` +
        'settings are correctly set.');
    });
}

// TODO: File - duplication in arrange sections
function succeedWithCorrectSettingsAndFakeAdapters() {
  it('should succed to collect correct coverage information for the requested file in x discrete steps.', async () => {
    const progressReporterSpy = Imports.Fakes.Adapters.vscode.buildSpyOfProgressReporter(Imports.Fakes.Adapters.vscode.buildFakeProgressReporter());
    const errorChannel = Imports.Fakes.Adapters.vscode.buildFakeErrorChannel();
    const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const settings = Imports.Domain.Implementations.SettingsProvider.make({ errorChannel, workspace }).settings;
    const progressReporter = progressReporterSpy.object;
    const mkdir = Imports.Fakes.Adapters.FileSystem.buildFakeSucceedingMkDir();
    const stat = Imports.Fakes.Adapters.FileSystem.buildFakeSucceedingStatFile();
    const buildTreeDirectoryResolver = Imports.Domain.Implementations.BuildTreeDirectoryResolver.make({ errorChannel, settings, mkdir, stat, progressReporter });
    const execFileForCommand = Imports.Fakes.Adapters.ProcessControl.buildFakeSucceedingProcess();
    const execFileForTarget = Imports.Fakes.Adapters.ProcessControl.buildFakeSucceedingProcess();
    const cmake = Imports.Domain.Implementations.Cmake.make({
      settings,
      execFileForCommand,
      execFileForTarget,
      errorChannel,
      progressReporter
    });
    const globSearch = Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForExactlyOneMatch();
    const createReadStream = Imports.Fakes.Adapters.FileSystem.buildFakeStreamBuilder(Imports.Fakes.Adapters.FileSystem.buildValidLlvmCoverageJsonObjectStream);
    const coverageInfoCollector = Imports.Domain.Implementations.CoverageInfoCollector.make({ createReadStream, globSearch, errorChannel, progressReporter, settings });

    const provider = Imports.Domain.Implementations.DecorationLocationsProvider.make({
      settings,
      buildTreeDirectoryResolver,
      cmake,
      coverageInfoCollector
    });

    const decorations = await provider.getDecorationLocationsForUncoveredCodeRegions('/a/source/file.cpp');

    const uncoveredRegions: Array<Imports.Domain.Abstractions.RegionCoverageInfo> = [];
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
import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as Imports from './imports';

describe('acceptance suite of tests', () => {
  describe('The decoration location provider service behavior', () => {
    describe('The service being instantiated with faked adapters and domain sub modules', instantiateService);
    describe('The service failing because of incorrect settings leading to mis-behaving adapters', () => {
      describe('When issues arise with the build tree directory path resolution', failBecauseOfIssuesWithBuildTreeDirectoryAccess);
      describe('When issues arise with the cmake target building', failBecauseOfIssuesWithCmakeTargetBuilding);
      describe('When issues arise with the coverage info file path resolution', failBecauseCoverageInfoFileResolutionIssue);
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
    const execFile = Imports.Fakes.Adapters.ProcessControl.buildFakeFailingProcess();
    const globSearch = Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForNoMatch();
    const cmake = Imports.Domain.Implementations.Cmake.make({
      settings,
      execFile,
      errorChannel,
      progressReporter
    });
    const createReadStream = Imports.Fakes.Adapters.FileSystem.buildFakeStreamBuilder(Imports.Fakes.Adapters.FileSystem.buildEmptyReadableStream);
    const coverageInfoFileResolver = Imports.Domain.Implementations.CoverageInfoFileResolver.make({
      errorChannel,
      globSearch,
      progressReporter,
      settings
    });
    const coverageInfoCollector = Imports.Domain.Implementations.CoverageInfoCollector.make({
      coverageInfoFileResolver,
      createReadStream,
      errorChannel,
      progressReporter
    });

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

function failBecauseOfIssuesWithBuildTreeDirectoryAccess() {
  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the build tree directory can not be found and / or created', () => {
      const errorChannel = Imports.Fakes.Adapters.vscode.buildFakeErrorChannel();
      const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
      const settings = Imports.Domain.Implementations.SettingsProvider.make({ errorChannel, workspace }).settings;
      const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();
      const mkdir = Imports.Fakes.Adapters.FileSystem.buildFakeFailingMkDir();
      const stat = Imports.Fakes.Adapters.FileSystem.buildFakeFailingStatFile();
      const buildTreeDirectoryResolver = Imports.Domain.Implementations.BuildTreeDirectoryResolver.make({ errorChannel, settings, mkdir, stat, progressReporter });
      const execFile = Imports.Fakes.Adapters.ProcessControl.buildFakeFailingProcess();
      const globSearch = Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForNoMatch();
      const cmake = Imports.Domain.Implementations.Cmake.make({
        settings,
        execFile,
        errorChannel,
        progressReporter
      });
      const coverageInfoFileResolver = Imports.Domain.Implementations.CoverageInfoFileResolver.make({
        errorChannel,
        globSearch,
        progressReporter,
        settings
      });
      const createReadStream = Imports.Fakes.Adapters.FileSystem.buildFakeStreamBuilder(Imports.Fakes.Adapters.FileSystem.buildEmptyReadableStream);
      const coverageInfoCollector = Imports.Domain.Implementations.CoverageInfoCollector.make({
        coverageInfoFileResolver,
        createReadStream,
        errorChannel,
        progressReporter,
      });

      const provider = Imports.Domain.Implementations.DecorationLocationsProvider.make({
        settings,
        buildTreeDirectoryResolver,
        cmake,
        coverageInfoCollector
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejected;
    });
}

function failBecauseOfIssuesWithCmakeTargetBuilding() {
  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake command cannot be reached.', () => {
      const errorChannel = Imports.Fakes.Adapters.vscode.buildFakeErrorChannel();
      const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ cmakeCommand: '' });
      const settings = Imports.Domain.Implementations.SettingsProvider.make({ errorChannel, workspace }).settings;
      const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();
      const mkdir = Imports.Fakes.Adapters.FileSystem.buildFakeFailingMkDir();
      const stat = Imports.Fakes.Adapters.FileSystem.buildFakeSucceedingStatFile();
      const execFile = Imports.Fakes.Adapters.ProcessControl.buildFakeFailingProcess();
      const buildTreeDirectoryResolver = Imports.Domain.Implementations.BuildTreeDirectoryResolver.make({ errorChannel, settings, mkdir, stat, progressReporter });
      const cmake = Imports.Domain.Implementations.Cmake.make({
        errorChannel,
        execFile,
        progressReporter,
        settings
      });
      const createReadStream = Imports.Fakes.Adapters.FileSystem.buildFakeStreamBuilder(Imports.Fakes.Adapters.FileSystem.buildEmptyReadableStream);
      const globSearch = Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForNoMatch();
      const coverageInfoFileResolver = Imports.Domain.Implementations.CoverageInfoFileResolver.make({
        errorChannel,
        globSearch,
        progressReporter,
        settings
      });
      const coverageInfoCollector = Imports.Domain.Implementations.CoverageInfoCollector.make({
        coverageInfoFileResolver,
        createReadStream,
        errorChannel,
        progressReporter,
      });

      const provider = Imports.Domain.Implementations.DecorationLocationsProvider.make({
        settings,
        buildTreeDirectoryResolver,
        cmake,
        coverageInfoCollector
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejected;
    });
}

function failBecauseCoverageInfoFileResolutionIssue() {
  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the coverage info file name cannot be found', () => {
      const errorChannel = Imports.Fakes.Adapters.vscode.buildFakeErrorChannel();
      const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ coverageInfoFileName: 'baadf00d' });
      const settings = Imports.Domain.Implementations.SettingsProvider.make({ errorChannel, workspace }).settings;
      const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();
      const mkdir = Imports.Fakes.Adapters.FileSystem.buildFakeFailingMkDir();
      const stat = Imports.Fakes.Adapters.FileSystem.buildFakeSucceedingStatFile();
      const buildTreeDirectoryResolver = Imports.Domain.Implementations.BuildTreeDirectoryResolver.make({ errorChannel, settings, mkdir, stat, progressReporter });
      const execFile = Imports.Fakes.Adapters.ProcessControl.buildFakeSucceedingProcess();
      const globSearch = Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForSeveralMatch();
      const cmake = Imports.Domain.Implementations.Cmake.make({
        settings,
        execFile,
        errorChannel,
        progressReporter
      });
      const createReadStream = Imports.Fakes.Adapters.FileSystem.buildFakeStreamBuilder(Imports.Fakes.Adapters.FileSystem.buildEmptyReadableStream);
      const coverageInfoFileResolver = Imports.Domain.Implementations.CoverageInfoFileResolver.make({
        errorChannel,
        globSearch,
        progressReporter,
        settings
      });
      const coverageInfoCollector = Imports.Domain.Implementations.CoverageInfoCollector.make({
        coverageInfoFileResolver,
        createReadStream,
        errorChannel,
        progressReporter,
      });

      const provider = Imports.Domain.Implementations.DecorationLocationsProvider.make({
        settings,
        buildTreeDirectoryResolver,
        cmake,
        coverageInfoCollector
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejected;
    });
}

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
    const execFile = Imports.Fakes.Adapters.ProcessControl.buildFakeSucceedingProcess();
    const globSearch = Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForExactlyOneMatch();
    const cmake = Imports.Domain.Implementations.Cmake.make({
      settings,
      execFile,
      errorChannel,
      progressReporter
    });
    const createReadStream = Imports.Fakes.Adapters.FileSystem.buildFakeStreamBuilder(Imports.Fakes.Adapters.FileSystem.buildValidLlvmCoverageJsonObjectStream);
    const coverageInfoFileResolver = Imports.Domain.Implementations.CoverageInfoFileResolver.make({
      errorChannel,
      globSearch,
      progressReporter,
      settings
    });
    const coverageInfoCollector = Imports.Domain.Implementations.CoverageInfoCollector.make({
      coverageInfoFileResolver,
      createReadStream,
      errorChannel,
      progressReporter,
    });

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
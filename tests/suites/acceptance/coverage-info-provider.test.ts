import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as Imports from './imports';

describe('acceptance suite of tests', () => {
  describe('The coverage info provider service behavior', () => {
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
    const adapters = {
      workspace: Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
      outputChannel: Imports.Fakes.Adapters.vscode.buildFakeOutputChannel(),
      progressReporter: Imports.Fakes.Adapters.vscode.buildFakeProgressReporter(),
      mkdir: Imports.Fakes.Adapters.FileSystem.buildFakeFailingMkDir(),
      stat: Imports.Fakes.Adapters.FileSystem.buildFakeFailingStatFile(),
      execFile: Imports.Fakes.Adapters.ProcessControl.buildFakeFailingProcess(),
      globSearch: Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForNoMatch(),
      createReadStream: Imports.Fakes.Adapters.FileSystem.buildFakeStreamBuilder(Imports.Fakes.Adapters.FileSystem.buildEmptyReadableStream)
    };

    const instantiation = () => {
      Imports.Domain.Implementations.CoverageInfoProvider.make({ ...buildContextFromAdapters(adapters) });
    };

    instantiation.should.not.throw();
  });
}

function failBecauseOfIssuesWithBuildTreeDirectoryAccess() {
  it('should not be able to provide any coverage info for a file ' +
    'when the build tree directory can not be found and / or created', () => {
      const adapters = {
        outputChannel: Imports.Fakes.Adapters.vscode.buildFakeOutputChannel(),
        workspace: Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
        progressReporter: Imports.Fakes.Adapters.vscode.buildFakeProgressReporter(),
        mkdir: Imports.Fakes.Adapters.FileSystem.buildFakeFailingMkDir(),
        stat: Imports.Fakes.Adapters.FileSystem.buildFakeFailingStatFile(),
        execFile: Imports.Fakes.Adapters.ProcessControl.buildFakeFailingProcess(),
        globSearch: Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForNoMatch(),
        createReadStream: Imports.Fakes.Adapters.FileSystem.buildFakeStreamBuilder(Imports.Fakes.Adapters.FileSystem.buildEmptyReadableStream)
      };

      const provider = Imports.Domain.Implementations.CoverageInfoProvider.make({ ...buildContextFromAdapters(adapters) });

      return provider.getCoverageInfoForFile('foo').should.eventually.be.rejected;
    });
}

function failBecauseOfIssuesWithCmakeTargetBuilding() {
  it('should not be able to provide any coverage info for a file ' +
    'when the cmake command cannot be reached.', () => {
      const adapters = {
        outputChannel: Imports.Fakes.Adapters.vscode.buildFakeOutputChannel(),
        workspace: Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ cmakeCommand: '' }),
        progressReporter: Imports.Fakes.Adapters.vscode.buildFakeProgressReporter(),
        mkdir: Imports.Fakes.Adapters.FileSystem.buildFakeFailingMkDir(),
        stat: Imports.Fakes.Adapters.FileSystem.buildFakeSucceedingStatFile(),
        globSearch: Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForNoMatch(),
        createReadStream: Imports.Fakes.Adapters.FileSystem.buildFakeStreamBuilder(Imports.Fakes.Adapters.FileSystem.buildEmptyReadableStream),
        execFile: Imports.Fakes.Adapters.ProcessControl.buildFakeFailingProcess()
      };

      const provider = Imports.Domain.Implementations.CoverageInfoProvider.make({ ...buildContextFromAdapters(adapters) });

      return provider.getCoverageInfoForFile('foo').should.eventually.be.rejected;
    });
}

function failBecauseCoverageInfoFileResolutionIssue() {
  it('should not be able to provide any coverage info for a file ' +
    'when the coverage info file name cannot be found', () => {
      const adapters = {
        outputChannel: Imports.Fakes.Adapters.vscode.buildFakeOutputChannel(),
        workspace: Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ coverageInfoFileName: 'baadf00d' }),
        progressReporter: Imports.Fakes.Adapters.vscode.buildFakeProgressReporter(),
        mkdir: Imports.Fakes.Adapters.FileSystem.buildFakeFailingMkDir(),
        stat: Imports.Fakes.Adapters.FileSystem.buildFakeSucceedingStatFile(),
        execFile: Imports.Fakes.Adapters.ProcessControl.buildFakeSucceedingProcess(),
        globSearch: Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForSeveralMatch(),
        createReadStream: Imports.Fakes.Adapters.FileSystem.buildFakeStreamBuilder(Imports.Fakes.Adapters.FileSystem.buildEmptyReadableStream)
      };

      const provider = Imports.Domain.Implementations.CoverageInfoProvider.make({ ...buildContextFromAdapters(adapters) });

      return provider.getCoverageInfoForFile('foo').should.eventually.be.rejected;
    });
}

function succeedWithCorrectSettingsAndFakeAdapters() {
  it('should succed to collect correct coverage information for the requested file in x discrete steps.', async () => {
    const progressReporterSpy = Imports.Fakes.Adapters.vscode.buildSpyOfProgressReporter(Imports.Fakes.Adapters.vscode.buildFakeProgressReporter());

    const adapters = {
      outputChannel: Imports.Fakes.Adapters.vscode.buildFakeOutputChannel(),
      workspace: Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
      progressReporter: progressReporterSpy.object,
      mkdir: Imports.Fakes.Adapters.FileSystem.buildFakeSucceedingMkDir(),
      stat: Imports.Fakes.Adapters.FileSystem.buildFakeSucceedingStatFile(),
      execFile: Imports.Fakes.Adapters.ProcessControl.buildFakeSucceedingProcess(),
      globSearch: Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForExactlyOneMatch(),
      createReadStream: Imports.Fakes.Adapters.FileSystem.buildFakeStreamBuilder(Imports.Fakes.Adapters.FileSystem.buildValidLlvmCoverageJsonObjectStream)
    };

    const provider = Imports.Domain.Implementations.CoverageInfoProvider.make({ ...buildContextFromAdapters(adapters) });

    const coverageInfo = await provider.getCoverageInfoForFile('/a/source/file.cpp');

    const uncoveredRegions: Array<Imports.Domain.Abstractions.RegionCoverageInfo> = [];
    for await (const region of coverageInfo.uncoveredRegions)
      uncoveredRegions.push(region);

    const summary = await coverageInfo.summary;

    summary.should.be.deep.equal({
      count: 2,
      covered: 2,
      notCovered: 0,
      percent: 100
    });

    uncoveredRegions.length.should.be.equal(1);
    uncoveredRegions[0].range.should.be.deep.equal({
      start: {
        line: 5,
        character: 52
      },
      end: {
        line: 5,
        character: 70
      }
    });

    progressReporterSpy.countFor('report').should.be.equal(6);
  });
}

function buildContextFromAdapters(adapters: Adapters): CoverageInfoProviderContext {
  const {
    createReadStream,
    outputChannel,
    execFile,
    globSearch,
    mkdir,
    stat,
    progressReporter,
    workspace
  } = adapters;

  const settings = Imports.Domain.Implementations.SettingsProvider.make({ outputChannel, workspace }).settings;
  const coverageInfoFileResolver = Imports.Domain.Implementations.CoverageInfoFileResolver.make({
    outputChannel,
    globSearch,
    progressReporter,
    settings
  });

  return {
    settings,
    buildTreeDirectoryResolver: Imports.Domain.Implementations.BuildTreeDirectoryResolver.make({ outputChannel, settings, mkdir, stat, progressReporter }),
    cmake: Imports.Domain.Implementations.Cmake.make({
      settings,
      execFile,
      outputChannel,
      progressReporter
    }),
    coverageInfoCollector: Imports.Domain.Implementations.CoverageInfoCollector.make({
      coverageInfoFileResolver,
      createReadStream,
      outputChannel,
      progressReporter
    })
  };
}

type Adapters = {
  workspace: ReturnType<typeof Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings>,
  outputChannel: ReturnType<typeof Imports.Fakes.Adapters.vscode.buildFakeOutputChannel>,
  progressReporter: ReturnType<typeof Imports.Fakes.Adapters.vscode.buildFakeProgressReporter>,
  mkdir: ReturnType<typeof Imports.Fakes.Adapters.FileSystem.buildFakeFailingMkDir>,
  stat: ReturnType<typeof Imports.Fakes.Adapters.FileSystem.buildFakeFailingStatFile>,
  execFile: ReturnType<typeof Imports.Fakes.Adapters.ProcessControl.buildFakeFailingProcess>,
  globSearch: ReturnType<typeof Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForNoMatch>,
  createReadStream: ReturnType<typeof Imports.Fakes.Adapters.FileSystem.buildFakeStreamBuilder>
};

type CoverageInfoProviderContext = typeof Imports.Domain.Implementations.CoverageInfoProvider.make extends (context: infer T) => any ? T : never;
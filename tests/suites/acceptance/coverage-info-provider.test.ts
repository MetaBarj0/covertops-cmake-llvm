import * as chai from "chai";
import { describe, it } from "mocha";
import * as chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
chai.should();

import * as Types from "./types";

import * as FileSystemFakes from "../../fakes/adapters/file-system";
import * as VscodeFakes from "../../fakes/adapters/vscode";
import * as ProcessControlFakes from "../../fakes/adapters/process-control";
import * as SettingsProvider from "../../../src/modules/implementations/settings-provider";
import * as BuildTreeDirectoryResolver from "../../../src/modules/implementations/build-tree-directory-resolver";
import * as Cmake from "../../../src/modules/implementations/cmake";
import * as CoverageInfoCollector from "../../../src/modules/implementations/coverage-info-collector";
import * as CoverageInfoProvider from "../../../src/modules/implementations/coverage-info-provider";
import * as CoverageInfoFileResolver from "../../../src/modules/implementations/coverage-info-file-resolver";

describe("acceptance suite of tests", () => {
  describe("The coverage info provider service behavior", () => {
    describe("The service being instantiated with faked adapters and domain sub modules", instantiateService);
    describe("The service failing because of incorrect settings leading to mis-behaving adapters", () => {
      describe("When issues arise with the build tree directory path resolution", failBecauseOfIssuesWithBuildTreeDirectoryAccess);
      describe("When issues arise with the cmake target building", failBecauseOfIssuesWithCmakeTargetBuilding);
      describe("When issues arise with the coverage info file path resolution", failBecauseCoverageInfoFileResolutionIssue);
    });
    describe("The service succeding with correct settings and fake adapters", succeedWithCorrectSettingsAndFakeAdapters);
  });
});

function instantiateService() {
  it("should not throw when instantiated with faked adapters.", () => {
    const adapters = {
      workspace: VscodeFakes.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
      outputChannel: VscodeFakes.buildFakeOutputChannel(),
      progressReporter: VscodeFakes.buildFakeProgressReporter(),
      mkdir: FileSystemFakes.buildFakeFailingMkDir(),
      stat: FileSystemFakes.buildFakeFailingStatFile(),
      execFile: ProcessControlFakes.buildFakeFailingProcess(),
      globSearch: FileSystemFakes.buildFakeGlobSearchForNoMatch(),
      createReadStream: FileSystemFakes.buildFakeStreamBuilder(FileSystemFakes.buildEmptyReadableStream)
    };

    const instantiation = () => {
      CoverageInfoProvider.make({ ...buildContextFromAdapters(adapters) });
    };

    instantiation.should.not.throw();
  });
}

function failBecauseOfIssuesWithBuildTreeDirectoryAccess() {
  it("should not be able to provide any coverage info for a file " +
    "when the build tree directory can not be found and / or created", () => {
      const adapters = {
        workspace: VscodeFakes.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
        outputChannel: VscodeFakes.buildFakeOutputChannel(),
        progressReporter: VscodeFakes.buildFakeProgressReporter(),
        mkdir: FileSystemFakes.buildFakeFailingMkDir(),
        stat: FileSystemFakes.buildFakeFailingStatFile(),
        execFile: ProcessControlFakes.buildFakeFailingProcess(),
        globSearch: FileSystemFakes.buildFakeGlobSearchForNoMatch(),
        createReadStream: FileSystemFakes.buildFakeStreamBuilder(FileSystemFakes.buildEmptyReadableStream)
      };

      const provider = CoverageInfoProvider.make({ ...buildContextFromAdapters(adapters) });

      return provider.getCoverageInfoForFile("foo").should.eventually.be.rejected;
    });
}

function failBecauseOfIssuesWithCmakeTargetBuilding() {
  it("should not be able to provide any coverage info for a file " +
    "when the cmake command cannot be reached.", () => {
      const adapters = {
        outputChannel: VscodeFakes.buildFakeOutputChannel(),
        workspace: VscodeFakes.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ cmakeCommand: "" }),
        progressReporter: VscodeFakes.buildFakeProgressReporter(),
        mkdir: FileSystemFakes.buildFakeFailingMkDir(),
        stat: FileSystemFakes.buildFakeSucceedingStatFile(),
        globSearch: FileSystemFakes.buildFakeGlobSearchForNoMatch(),
        createReadStream: FileSystemFakes.buildFakeStreamBuilder(FileSystemFakes.buildEmptyReadableStream),
        execFile: ProcessControlFakes.buildFakeFailingProcess()
      };

      const provider = CoverageInfoProvider.make({ ...buildContextFromAdapters(adapters) });

      return provider.getCoverageInfoForFile("foo").should.eventually.be.rejected;
    });
}

function failBecauseCoverageInfoFileResolutionIssue() {
  it("should not be able to provide any coverage info for a file " +
    "when the coverage info file name cannot be found", () => {
      const adapters = {
        outputChannel: VscodeFakes.buildFakeOutputChannel(),
        workspace: VscodeFakes.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ coverageInfoFileName: "baadf00d" }),
        progressReporter: VscodeFakes.buildFakeProgressReporter(),
        mkdir: FileSystemFakes.buildFakeFailingMkDir(),
        stat: FileSystemFakes.buildFakeSucceedingStatFile(),
        execFile: ProcessControlFakes.buildFakeSucceedingProcess(),
        globSearch: FileSystemFakes.buildFakeGlobSearchForSeveralMatch(),
        createReadStream: FileSystemFakes.buildFakeStreamBuilder(FileSystemFakes.buildEmptyReadableStream)
      };

      const provider = CoverageInfoProvider.make({ ...buildContextFromAdapters(adapters) });

      return provider.getCoverageInfoForFile("foo").should.eventually.be.rejected;
    });
}

function succeedWithCorrectSettingsAndFakeAdapters() {
  it("should succed to collect correct coverage information for the requested file in x discrete steps.", async () => {
    const progressReporterSpy = VscodeFakes.buildSpyOfProgressReporter(VscodeFakes.buildFakeProgressReporter());

    const adapters = {
      outputChannel: VscodeFakes.buildFakeOutputChannel(),
      workspace: VscodeFakes.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
      progressReporter: progressReporterSpy.object,
      mkdir: FileSystemFakes.buildFakeSucceedingMkDir(),
      stat: FileSystemFakes.buildFakeSucceedingStatFile(),
      execFile: ProcessControlFakes.buildFakeSucceedingProcess(),
      globSearch: FileSystemFakes.buildFakeGlobSearchForExactlyOneMatch(),
      createReadStream: FileSystemFakes.buildFakeStreamBuilder(FileSystemFakes.buildValidLlvmCoverageJsonObjectStream)
    };

    const provider = CoverageInfoProvider.make({ ...buildContextFromAdapters(adapters) });

    const coverageInfo = await provider.getCoverageInfoForFile("/a/source/file.cpp");

    const uncoveredRegions: Array<Types.Modules.RegionCoverageInfo> = [];
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

    progressReporterSpy.countFor("report").should.be.equal(6);
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

  const settings = SettingsProvider.make({ outputChannel, workspace }).settings;
  const coverageInfoFileResolver = CoverageInfoFileResolver.make({
    outputChannel,
    globSearch,
    progressReporter,
    settings
  });

  return {
    settings,
    buildTreeDirectoryResolver: BuildTreeDirectoryResolver.make({ outputChannel, settings, mkdir, stat, progressReporter }),
    cmake: Cmake.make({
      settings,
      execFile,
      outputChannel,
      progressReporter
    }),
    coverageInfoCollector: CoverageInfoCollector.make({
      coverageInfoFileResolver,
      createReadStream,
      outputChannel,
      progressReporter
    })
  };
}

type Adapters = {
  workspace: ReturnType<typeof VscodeFakes.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings>,
  outputChannel: ReturnType<typeof VscodeFakes.buildFakeOutputChannel>,
  progressReporter: ReturnType<typeof VscodeFakes.buildFakeProgressReporter>,
  mkdir: ReturnType<typeof FileSystemFakes.buildFakeFailingMkDir>,
  stat: ReturnType<typeof FileSystemFakes.buildFakeFailingStatFile>,
  execFile: ReturnType<typeof ProcessControlFakes.buildFakeFailingProcess>,
  globSearch: ReturnType<typeof FileSystemFakes.buildFakeGlobSearchForNoMatch>,
  createReadStream: ReturnType<typeof FileSystemFakes.buildFakeStreamBuilder>
};

type CoverageInfoProviderContext = typeof CoverageInfoProvider.make extends (context: infer T) => unknown ? T : never;
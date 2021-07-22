import * as chai from "chai";
import { describe, it } from "mocha";
import * as chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
chai.should();

import * as Types from "./types";

import * as VscodeFakes from "../../fakes/adapters/vscode";
import * as FileSystemFakes from "../../fakes/adapters/file-system";
import * as SettingsProvider from "../../../src/modules/implementations/settings-provider";
import * as CoverageInfoFileResolver from "../../../src/modules/implementations/coverage-info-file-resolver";
import { Spy } from "../../utils/spy";
import * as Definitions from "../../../src/extension/implementations/definitions";

describe("Unit test suite", () => {
  describe("the behavior of the coverage info file resolver", () => {
    describe("failing if the resolver does not find any file", shouldFailWhenNoFileIsFound);
    describe("failing if the resolver finds more than one file", shouldFailWhenMoreThanOneFileAreFound);
    describe("succeeding if the resolver finds exactly one file", shouldSucceedWhenExactlyOneFileIsFound);
  });
});

function shouldFailWhenNoFileIsFound() {
  it("should fail and report in output channel if the recursive search from the build tree directory does not find one file", () => {
    const outputChannelSpy = VscodeFakes.buildSpyOfOutputChannel(VscodeFakes.buildFakeOutputChannel());
    const globSearch = FileSystemFakes.buildFakeGlobSearchForNoMatch();
    const resolver = buildCoverageInfoFileResolver({ outputChannelSpy: outputChannelSpy, globSearch });

    return resolver.resolveCoverageInfoFileFullPath()
      .catch((error: Error) => {
        const errorMessage = "Cannot resolve the coverage info file path in the build tree directory. " +
          "Ensure that both " +
          `'${Definitions.extensionNameInSettings}: Build Tree Directory' and ` +
          `'${Definitions.extensionNameInSettings}: Coverage Info File Name' ` +
          "settings are correctly set.";

        error.message.should.contain(errorMessage);
        outputChannelSpy.countFor("appendLine").should.be.equal(1);
      });
  });
}

function shouldFailWhenMoreThanOneFileAreFound() {
  it("should fail if the recursive search from the build tree directory finds more than one file", () => {
    const outputChannelSpy = VscodeFakes.buildSpyOfOutputChannel(VscodeFakes.buildFakeOutputChannel());
    const globSearch = FileSystemFakes.buildFakeGlobSearchForSeveralMatch();

    const resolver = buildCoverageInfoFileResolver({ outputChannelSpy: outputChannelSpy, globSearch });

    return resolver.resolveCoverageInfoFileFullPath()
      .catch((error: Error) => {
        const errorMessage = "More than one coverage information file have been found in the build tree directory. " +
          "Ensure that both " +
          `'${Definitions.extensionNameInSettings}: Build Tree Directory' and ` +
          `'${Definitions.extensionNameInSettings}: Coverage Info File Name' ` +
          "settings are correctly set.";

        error.message.should.contain(errorMessage);
        outputChannelSpy.countFor("appendLine").should.be.equal(1);
      });
  });
}

function shouldSucceedWhenExactlyOneFileIsFound() {
  it("should resolve correctly if the recursive search from the build tree directory find exactly one file in one discrete step.", async () => {
    const progressReporterSpy = VscodeFakes.buildSpyOfProgressReporter(VscodeFakes.buildFakeProgressReporter());
    const globSearch = FileSystemFakes.buildFakeGlobSearchForExactlyOneMatch();
    const resolver = buildCoverageInfoFileResolver({ progressReporterSpy, globSearch });

    await resolver.resolveCoverageInfoFileFullPath();

    progressReporterSpy.countFor("report").should.be.equal(1);
  });
}


function buildAdapters(optionalSpiesAndAdapters: OptionalSpiesAndAdapters) {
  const outputChannel = optionalSpiesAndAdapters.outputChannelSpy ? optionalSpiesAndAdapters.outputChannelSpy.object : VscodeFakes.buildFakeOutputChannel();
  const progressReporter = optionalSpiesAndAdapters.progressReporterSpy ? optionalSpiesAndAdapters.progressReporterSpy.object : VscodeFakes.buildFakeProgressReporter();
  const workspace = VscodeFakes.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();

  return {
    workspace,
    outputChannel,
    globSearch: optionalSpiesAndAdapters.globSearch,
    progressReporter
  };
}

function buildCoverageInfoFileResolver(optionalSpiesAndAdapters: OptionalSpiesAndAdapters) {
  const adapters = buildAdapters(optionalSpiesAndAdapters);

  const settings = SettingsProvider.make({ ...adapters }).settings;

  return CoverageInfoFileResolver.make({ ...adapters, settings });
}

type OptionalSpiesAndAdapters = {
  outputChannelSpy?: Spy<Types.Adapters.Abstractions.vscode.OutputChannelLike>
  progressReporterSpy?: Spy<Types.Adapters.Abstractions.vscode.ProgressLike>,
  globSearch: Types.Adapters.Abstractions.FileSystem.GlobSearchCallable
};
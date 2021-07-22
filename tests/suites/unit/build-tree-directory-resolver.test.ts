import * as chai from "chai";
import { describe, it } from "mocha";
import * as chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
chai.should();

import * as VscodeFakes from "../../fakes/adapters/vscode";
import * as FileSystemFakes from "../../fakes/adapters/file-system";
import * as SettingsProvider from "../../../src/modules/implementations/settings-provider";
import * as BuildTreeDirectoryResolver from "../../../src/modules/implementations/build-tree-directory-resolver";
import * as Definitions from "../../../src/extension/definitions";

import * as path from "path";

describe("Unit test suite", () => {
  describe("the build tree directory resolver behavior", () => {
    describe("its failure to resolve a build tree directory as an absolute path", buildTreeDirectoryResolverShouldFailWhenBuildTreeDirectoryIsAnAbsolutePath);
    describe("its failure to resolve an inexisting build tree directory that cannot be created", buildTreeDirectoryResolverShouldFailWhenBuildTreeDirectoryDoesNotExistAndCannotBeCreated);
    describe("its success to resolve an existing build tree directory", buildTreeDirectoryResolverShouldSucceedWhenBuildTreeDirectoryExists);
    describe("its success to resolve an inexisting build tree directory that can be created", buildTreeDirectoryResolverShouldSucceedWhenBuildTreeDirectoryDoesNotExistAndCanBeCreated);
  });
});

function buildTreeDirectoryResolverShouldFailWhenBuildTreeDirectoryIsAnAbsolutePath() {
  it("should fail to resolve and report to output channel when the build tree directory setting looks like an absolute path", () => {
    const workspace = VscodeFakes.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({
      buildTreeDirectory: path.normalize("/absolute/build")
    });
    const outputChannelSpy = VscodeFakes.buildSpyOfOutputChannel(VscodeFakes.buildFakeOutputChannel());
    const outputChannel = outputChannelSpy.object;
    const settings = SettingsProvider.make({ outputChannel, workspace }).settings;
    const statFile = FileSystemFakes.buildFakeFailingStatFile();
    const mkDir = FileSystemFakes.buildFakeFailingMkDir();
    const progressReporter = VscodeFakes.buildFakeProgressReporter();

    const resolver = BuildTreeDirectoryResolver.make({
      settings,
      stat: statFile,
      mkdir: mkDir,
      progressReporter,
      outputChannel
    });

    return resolver.resolve()
      .catch((error: Error) => {
        error.message.should.contain(
          `Incorrect absolute path specified in '${Definitions.extensionNameInSettings}: Build Tree Directory'. It must be a relative path.`);

        outputChannelSpy.countFor("appendLine").should.be.equal(1);
      });
  });
}

function buildTreeDirectoryResolverShouldFailWhenBuildTreeDirectoryDoesNotExistAndCannotBeCreated() {
  it("should fail to resolve and report in output channel if specified relative path target does not exist and cannot be created", () => {
    const workspace = VscodeFakes.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const outputChannelSpy = VscodeFakes.buildSpyOfOutputChannel(VscodeFakes.buildFakeOutputChannel());
    const outputChannel = outputChannelSpy.object;
    const settings = SettingsProvider.make({ outputChannel, workspace }).settings;
    const statFile = FileSystemFakes.buildFakeFailingStatFile();
    const mkDir = FileSystemFakes.buildFakeFailingMkDir();
    const progressReporter = VscodeFakes.buildFakeProgressReporter();

    const resolver = BuildTreeDirectoryResolver.make({
      settings,
      stat: statFile,
      mkdir: mkDir,
      progressReporter,
      outputChannel
    });

    return resolver.resolve()
      .catch((error: Error) => {
        error.message.should.contain(
          "Cannot find or create the build tree directory. Ensure the " +
          `'${Definitions.extensionNameInSettings}: Build Tree Directory' setting is a valid relative path.`);

        outputChannelSpy.countFor("appendLine").should.be.equal(1);
      });
  });
}

function buildTreeDirectoryResolverShouldSucceedWhenBuildTreeDirectoryExists() {
  it("should resolve the full path of the build tree directory if the specified setting target an existing directory", async () => {
    const workspace = VscodeFakes.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const outputChannel = VscodeFakes.buildFakeOutputChannel();
    const settings = SettingsProvider.make({ outputChannel, workspace }).settings;
    const statFile = FileSystemFakes.buildFakeSucceedingStatFile();
    const mkDir = FileSystemFakes.buildFakeFailingMkDir();
    const progressReporterSpy = VscodeFakes.buildSpyOfProgressReporter(VscodeFakes.buildFakeProgressReporter());
    const progressReporter = progressReporterSpy.object;

    const resolver = BuildTreeDirectoryResolver.make({
      settings,
      stat: statFile,
      mkdir: mkDir,
      progressReporter,
      outputChannel
    });

    await resolver.resolve();

    progressReporterSpy.countFor("report").should.be.equal(1);
  });
}

function buildTreeDirectoryResolverShouldSucceedWhenBuildTreeDirectoryDoesNotExistAndCanBeCreated() {
  it("should resolve the full path of the build tree directory if the specified setting target " +
    "an unexisting directory that can be created", async () => {
      const workspace = VscodeFakes.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
      const outputChannel = VscodeFakes.buildFakeOutputChannel();
      const settings = SettingsProvider.make({ outputChannel, workspace }).settings;
      const statFile = FileSystemFakes.buildFakeFailingStatFile();
      const mkDir = FileSystemFakes.buildFakeSucceedingMkDir();
      const progressReporterSpy = VscodeFakes.buildSpyOfProgressReporter(VscodeFakes.buildFakeProgressReporter());
      const progressReporter = progressReporterSpy.object;

      const resolver = BuildTreeDirectoryResolver.make({
        settings,
        stat: statFile,
        mkdir: mkDir,
        progressReporter,
        outputChannel
      });

      await resolver.resolve();

      progressReporterSpy.countFor("report").should.be.equal(1);
    });
}
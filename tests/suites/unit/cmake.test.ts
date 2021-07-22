import * as chai from "chai";
import { describe, it } from "mocha";
import * as chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
chai.should();

import * as VscodeFakes from "../../fakes/adapters/vscode";
import * as ProcessControlFakes from "../../fakes/adapters/process-control";
import * as SettingsProvider from "../../../src/modules/implementations/settings-provider";
import * as Cmake from "../../../src/modules/implementations/cmake";
import * as Definitions from "../../../src/extension/implementations/definitions";

describe("Unit test suite", () => {
  describe("cmake behavior", () => {
    describe("cmake failing because of a cmake command that is unreachable", cmakeShouldFailBecauseCmakeCommandIsUnreachable);
    describe("cmake failing at generating the project", cmakeShouldFailBecauseItCannotGenerateTheProject);
    describe("cmake failing at building a target", cmakeShouldFailBecauseItCannotBuildATarget);
    describe("cmake succeeding in building a target with correct settings", cmakeShouldSucceedWithCorrectSettings);
  });
});

function cmakeShouldFailBecauseCmakeCommandIsUnreachable() {
  it("should fail and reports to output channel if the cmake command is not reachable", () => {
    const workspace = VscodeFakes.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ "cmakeCommand": "" });
    const outputChannelSpy = VscodeFakes.buildSpyOfOutputChannel(VscodeFakes.buildFakeOutputChannel());
    const outputChannel = outputChannelSpy.object;
    const settings = SettingsProvider.make({ outputChannel, workspace }).settings;
    const execFile = ProcessControlFakes.buildFakeFailingProcess(ProcessControlFakes.FailureStages.reach);
    const progressReporterSpy = VscodeFakes.buildSpyOfProgressReporter(VscodeFakes.buildFakeProgressReporter());
    const progressReporter = progressReporterSpy.object;

    const cmake = Cmake.make({
      settings,
      progressReporter,
      outputChannel,
      execFile
    });

    return cmake.buildTarget()
      .catch((error: Error) => error)
      .then(error => {
        (<Error>error).message.should.contain(
          `Cannot find the cmake command. Ensure the '${Definitions.extensionNameInSettings}: Cmake Command' ` +
          "setting is correctly set. Have you verified your PATH environment variable?");

        progressReporterSpy.countFor("report").should.be.equal(0);
        outputChannelSpy.countFor("appendLine").should.be.equal(1);
      });
  });
}

function cmakeShouldFailBecauseItCannotGenerateTheProject() {
  it("should fail and report in output channel if a falure occurs at project generation stage", () => {
    const workspace = VscodeFakes.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ "rootDirectory": "not a cmake project folder" });
    const outputChannelSpy = VscodeFakes.buildSpyOfOutputChannel(VscodeFakes.buildFakeOutputChannel());
    const outputChannel = outputChannelSpy.object;
    const settings = SettingsProvider.make({ outputChannel, workspace }).settings;
    const execFile = ProcessControlFakes.buildFakeFailingProcess(ProcessControlFakes.FailureStages.generate);
    const progressReporterSpy = VscodeFakes.buildSpyOfProgressReporter(VscodeFakes.buildFakeProgressReporter());
    const progressReporter = progressReporterSpy.object;

    const cmake = Cmake.make({
      settings,
      progressReporter,
      outputChannel,
      execFile
    });

    return cmake.buildTarget()
      .catch((error: Error) => error)
      .then(error => {
        (<Error>error).message.should.contain("Cannot generate the cmake project in the " +
          `${settings.rootDirectory} directory. ` +
          "Ensure either you have opened a valid cmake project, or the cmake project has not already been generated using different options. " +
          `You may have to take a look in '${Definitions.extensionNameInSettings}: Additional Cmake Options' settings ` +
          "and check the generator used is correct for instance."
        );

        outputChannelSpy.countFor("appendLine").should.be.equal(1);
        progressReporterSpy.countFor("report").should.be.equal(1);
      });

  });
}

function cmakeShouldFailBecauseItCannotBuildATarget() {
  it("should fail and reports in output channel if a failure occurs in target building", () => {
    const workspace = VscodeFakes.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ "cmakeTarget": "very bad target" });
    const outputChannelSpy = VscodeFakes.buildSpyOfOutputChannel(VscodeFakes.buildFakeOutputChannel());
    const outputChannel = outputChannelSpy.object;
    const settings = SettingsProvider.make({ outputChannel, workspace }).settings;
    const execFile = ProcessControlFakes.buildFakeFailingProcess(ProcessControlFakes.FailureStages.build);
    const progressReporterSpy = VscodeFakes.buildSpyOfProgressReporter(VscodeFakes.buildFakeProgressReporter());
    const progressReporter = progressReporterSpy.object;

    const cmake = Cmake.make({
      settings,
      progressReporter,
      outputChannel,
      execFile
    });

    return cmake.buildTarget()
      .catch((error: Error) => error)
      .then(error => {
        (<Error>error).message.should.contain(
          `Error: Could not build the specified cmake target ${settings.cmakeTarget}. ` +
          `Ensure '${Definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`);

        outputChannelSpy.countFor("appendLine").should.be.equal(1);
        progressReporterSpy.countFor("report").should.be.equal(2);
      });

  });
}

function cmakeShouldSucceedWithCorrectSettings() {
  it("should be instantiated and succeed when asking for building a target in three discrete steps", async () => {
    const workspace = VscodeFakes.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const outputChannelSpy = VscodeFakes.buildSpyOfOutputChannel(VscodeFakes.buildFakeOutputChannel());
    const outputChannel = outputChannelSpy.object;
    const settings = SettingsProvider.make({ outputChannel, workspace }).settings;
    const execFile = ProcessControlFakes.buildFakeSucceedingProcess();
    const progressReporterSpy = VscodeFakes.buildSpyOfProgressReporter(VscodeFakes.buildFakeProgressReporter());
    const progressReporter = progressReporterSpy.object;

    const cmake = Cmake.make({
      settings,
      progressReporter,
      outputChannel,
      execFile
    });

    await cmake.buildTarget();

    progressReporterSpy.countFor("report").should.be.equal(3);
    outputChannelSpy.countFor("appendLine").should.be.equal(0);
  });
}
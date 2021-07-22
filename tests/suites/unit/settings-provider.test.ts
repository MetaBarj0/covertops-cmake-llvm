import * as chai from "chai";
import { describe, it } from "mocha";
import * as chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
chai.should();

import * as Fakes from "../../fakes/adapters/vscode";
import * as SettingsProvider from "../../../src/modules/implementations/settings-provider";
import { defaultSetting } from "../../utils/settings";

describe("Unit test suite", () => {
  describe("The setting provider behavior", () => {
    describe("With a workspace that is not loaded, that is, no root folder", shouldFailBecauseOfNoRootFolderOpened);
    describe("With a loaded workspace, having a loaded root folder", shouldSucceedAndExposeDefaultSettings);
  });
});

function shouldFailBecauseOfNoRootFolderOpened() {
  it("should be instantiated correctly but throw an exception and report in output channel when workspace folders are not set", () => {
    const workspace = Fakes.buildFakeWorkspaceWithoutWorkspaceFolderAndWithoutSettings();
    const outputChannelSpy = Fakes.buildSpyOfOutputChannel(Fakes.buildFakeOutputChannel());
    const outputChannel = outputChannelSpy.object;

    const provider = SettingsProvider.make({ workspace, outputChannel });

    const errorMessage = "A workspace must be loaded to get coverage information.";

    (() => { provider.settings; }).should.throw(errorMessage);

    outputChannelSpy.countFor("appendLine").should.be.equal(1);
  });
}

function shouldSucceedAndExposeDefaultSettings() {
  it("should be instantiated correctly with a vscode workspace-like instance and provide " +
    "settings with correct default values", () => {
      const workspace = Fakes.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
      const outputChannel = Fakes.buildFakeOutputChannel();
      const expectedSettings = {
        additionalCmakeOptions: <Array<string>>[],
        buildTreeDirectory: defaultSetting("buildTreeDirectory"),
        cmakeCommand: defaultSetting("cmakeCommand"),
        cmakeTarget: defaultSetting("cmakeTarget"),
        coverageInfoFileName: defaultSetting("coverageInfoFileName"),
        rootDirectory: defaultSetting("rootDirectory")
      } as const;

      const settings = SettingsProvider.make({ workspace, outputChannel }).settings;

      settings.should.be.deep.equal(expectedSettings);
    });
}

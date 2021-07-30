import * as chai from "chai";
import { describe, it } from "mocha";
import * as chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
chai.should();

import * as SettingsProvider from "../../../src/modules/implementations/settings-provider";
import * as Fakes from "../../fakes/adapters/vscode";

import * as vscode from "vscode";

describe("Querying settings from a setting provider initialized with a workspace that does not have a root folder.", () => {
  it("should throw an error when settings are queried from a setting provider", () => {
    (() => {
      SettingsProvider.make({
        workspace: vscode.workspace,
        outputChannel: Fakes.buildFakeOutputChannel()
      }).settings;
    }).should.throw(
      "A workspace must be loaded to get coverage information.");
  });
});

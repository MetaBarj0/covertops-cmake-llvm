import * as Types from "./types";

import * as Definitions from "../../extension/implementations/definitions";
import * as Strings from "../../extension/implementations/strings";
import * as Settings from "./settings";

export function make(adapters: Adapters): Types.Modules.SettingsProvider {
  return new SettingsProvider(adapters);
}

type Adapters = {
  workspace: Types.Adapters.vscode.VscodeWorkspaceLike,
  outputChannel: Types.Adapters.vscode.OutputChannelLike
};

class SettingsProvider implements Types.Modules.SettingsProvider {
  constructor(adapters: Adapters) {
    this.workspace = adapters.workspace;
    this.outputChannel = adapters.outputChannel;
  }

  get settings(): Types.Modules.Settings {
    this.ensureWorkspaceIsLoaded();

    const workspaceSettings = this.workspace.getConfiguration(Definitions.extensionId);
    const workspaceFolders = this.workspace.workspaceFolders as Array<Types.Adapters.vscode.VscodeWorkspaceFolderLike>;
    const rootDirectory = workspaceFolders[0].uri.fsPath;

    return Settings.make(
      workspaceSettings.get("cmakeCommand") as string,
      workspaceSettings.get("buildTreeDirectory") as string,
      workspaceSettings.get("cmakeTarget") as string,
      workspaceSettings.get("coverageInfoFileName") as string,
      workspaceSettings.get("additionalCmakeOptions") as Array<string>,
      rootDirectory
    );
  }

  private ensureWorkspaceIsLoaded() {
    if (this.workspace.workspaceFolders)
      return;

    const errorMessage = Strings.errorWorkspaceNotLoaded;

    this.outputChannel.appendLine(errorMessage);

    throw new Error(errorMessage);
  }

  private readonly workspace: Types.Adapters.vscode.VscodeWorkspaceLike;
  private readonly outputChannel: Types.Adapters.vscode.OutputChannelLike;
}

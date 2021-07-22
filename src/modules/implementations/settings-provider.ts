import * as Types from "./types";

import * as Definitions from "../../extension/implementations/definitions";
import * as Settings from "./settings";

export function make(adapters: Adapters): Types.Modules.Abstractions.SettingsProvider {
  return new SettingsProvider(adapters);
}

type Adapters = {
  workspace: Types.Adapters.Abstractions.vscode.VscodeWorkspaceLike,
  outputChannel: Types.Adapters.Abstractions.vscode.OutputChannelLike
};

class SettingsProvider implements Types.Modules.Abstractions.SettingsProvider {
  constructor(adapters: Adapters) {
    this.workspace = adapters.workspace;
    this.outputChannel = adapters.outputChannel;
  }

  get settings(): Types.Modules.Abstractions.Settings {
    this.ensureWorkspaceIsLoaded();

    const workspaceSettings = this.workspace.getConfiguration(Definitions.extensionId);
    const workspaceFolders = this.workspace.workspaceFolders as Array<Types.Adapters.Abstractions.vscode.VscodeWorkspaceFolderLike>;
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

    const errorMessage = "A workspace must be loaded to get coverage information.";

    this.outputChannel.appendLine(errorMessage);

    throw new Error(errorMessage);
  }

  private readonly workspace: Types.Adapters.Abstractions.vscode.VscodeWorkspaceLike;
  private readonly outputChannel: Types.Adapters.Abstractions.vscode.OutputChannelLike;
}

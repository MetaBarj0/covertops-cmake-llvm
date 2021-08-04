import * as Types from "../../../types";

import * as Definitions from "../../../definitions";
import * as Strings from "../../../strings";
import * as Settings from "./settings";

export function make(adapters: Adapters): Types.Modules.SettingsProvider.SettingsProvider {
  return new SettingsProvider(adapters);
}

type Adapters = {
  workspace: Types.Adapters.Vscode.WorkspaceLike,
  outputChannel: Types.Adapters.Vscode.OutputChannelLikeWithLines
};

class SettingsProvider implements Types.Modules.SettingsProvider.SettingsProvider {
  constructor(adapters: Adapters) {
    this.workspace = adapters.workspace;
    this.outputChannel = adapters.outputChannel;
  }

  get settings(): Types.Modules.SettingsProvider.Settings {
    this.ensureWorkspaceIsLoaded();

    const workspaceSettings = this.workspace.getConfiguration(Definitions.extensionId);
    const workspaceFolders = this.workspace.workspaceFolders as Array<Types.Adapters.Vscode.WorkspaceFolderLike>;
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

  private readonly workspace: Types.Adapters.Vscode.WorkspaceLike;
  private readonly outputChannel: Types.Adapters.Vscode.OutputChannelLikeWithLines;
}

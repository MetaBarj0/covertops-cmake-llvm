import * as Imports from "../imports";

export function make(adapters: Adapters) {
  return new SettingsProvider(adapters);
}

type Adapters = {
  workspace: Imports.Adapters.Abstractions.vscode.VscodeWorkspaceLike,
  outputChannel: Imports.Adapters.Abstractions.vscode.OutputChannelLike
};

class SettingsProvider implements Imports.Domain.Abstractions.SettingsProvider {
  constructor(adapters: Adapters) {
    this.workspace = adapters.workspace;
    this.outputChannel = adapters.outputChannel;
  }

  get settings(): Imports.Domain.Abstractions.Settings {
    this.ensureWorkspaceIsLoaded();

    const workspaceSettings = this.workspace.getConfiguration(Imports.Extension.Definitions.extensionId);
    const workspaceFolders = this.workspace.workspaceFolders as Array<Imports.Adapters.Abstractions.vscode.VscodeWorkspaceFolderLike>;
    const rootDirectory = workspaceFolders[0].uri.fsPath;

    return Imports.Domain.Implementations.Settings.make(
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

  private readonly workspace: Imports.Adapters.Abstractions.vscode.VscodeWorkspaceLike;
  private readonly outputChannel: Imports.Adapters.Abstractions.vscode.OutputChannelLike;
}

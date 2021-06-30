import * as Imports from '../imports';

export function make(adapters: Adapters) {
  return new SettingsProvider(adapters);
}

type Adapters = {
  workspace: Imports.Abstractions.Adapters.vscode.VscodeWorkspaceLike,
  errorChannel: Imports.Abstractions.Adapters.vscode.OutputChannelLike
};

// TODO: make an abstraction on that provider?
class SettingsProvider {
  constructor(adapters: Adapters) {
    this.workspace = adapters.workspace;
    this.errorChannel = adapters.errorChannel;
  }

  get settings(): Imports.Abstractions.Domain.Settings {
    this.ensureWorkspaceIsLoaded();

    const workspaceSettings = this.workspace.getConfiguration(Imports.Extension.definitions.extensionId);
    const workspaceFolders = this.workspace.workspaceFolders as Array<Imports.Abstractions.Adapters.vscode.VscodeWorkspaceFolderLike>;
    const rootDirectory = workspaceFolders[0].uri.fsPath;

    return Imports.Implementations.Domain.Settings.make(
      workspaceSettings.get('cmakeCommand') as string,
      workspaceSettings.get('buildTreeDirectory') as string,
      workspaceSettings.get('cmakeTarget') as string,
      workspaceSettings.get('coverageInfoFileName') as string,
      workspaceSettings.get('additionalCmakeOptions') as Array<string>,
      rootDirectory
    );
  }

  private ensureWorkspaceIsLoaded() {
    if (this.workspace.workspaceFolders)
      return;

    const errorMessage = 'A workspace must be loaded to get coverage information.';

    this.errorChannel.appendLine(errorMessage);

    throw new Error(errorMessage);
  }

  private readonly workspace: Imports.Abstractions.Adapters.vscode.VscodeWorkspaceLike;
  private readonly errorChannel: Imports.Abstractions.Adapters.vscode.OutputChannelLike;
}

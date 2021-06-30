import * as Imports from '../imports';
import { OutputChannelLike, VscodeWorkspaceFolderLike, VscodeWorkspaceLike } from '../../../shared-kernel/abstractions/vscode';

export function make(adapters: Adapters) {
  return new SettingsProvider(adapters);
}

type Adapters = {
  workspace: VscodeWorkspaceLike,
  errorChannel: OutputChannelLike
};

// TODO: make an abstraction on that provider?
class SettingsProvider {
  constructor(adapters: Adapters) {
    this.workspace = adapters.workspace;
    this.errorChannel = adapters.errorChannel;
  }

  get settings(): Imports.Abstractions.Settings {
    this.ensureWorkspaceIsLoaded();

    const workspaceSettings = this.workspace.getConfiguration(Imports.Extension.definitions.extensionId);
    const workspaceFolders = this.workspace.workspaceFolders as Array<VscodeWorkspaceFolderLike>;
    const rootDirectory = workspaceFolders[0].uri.fsPath;

    return Imports.Implementations.Settings.make(
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

  private readonly workspace: VscodeWorkspaceLike;
  private readonly errorChannel: OutputChannelLike;
}

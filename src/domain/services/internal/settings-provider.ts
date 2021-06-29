import * as definitions from '../../../definitions';
import { SettingsContract } from '../../interfaces/settings-contract';
import { Settings } from '../../value-objects/settings';
import { OutputChannelLike, VscodeWorkspaceFolderLike, VscodeWorkspaceLike } from '../../../adapters/interfaces/vscode';

export function make(adapters: Adapters) {
  return new SettingsProvider(adapters);
}

type Adapters = {
  workspace: VscodeWorkspaceLike,
  errorChannel: OutputChannelLike
};

class SettingsProvider {
  constructor(adapters: Adapters) {
    this.workspace = adapters.workspace;
    this.errorChannel = adapters.errorChannel;
  }

  get settings(): SettingsContract {
    this.ensureWorkspaceIsLoaded();

    const workspaceSettings = this.workspace.getConfiguration(definitions.extensionId);
    const workspaceFolders = this.workspace.workspaceFolders as Array<VscodeWorkspaceFolderLike>;
    const rootDirectory = workspaceFolders[0].uri.fsPath;

    return new Settings(
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

import * as definitions from '../../definitions';
import { Settings } from '../value-objects/settings';

export type VscodeUriLike = {
  readonly fsPath: string;
};

export type VscodeWorkspaceFolderLike = {
  readonly uri: VscodeUriLike;
};

export type VscodeWorkspaceConfigurationLike = {
  get<T>(section: string): T | undefined;
};

export type VscodeWorkspaceLike = {
  readonly workspaceFolders: ReadonlyArray<VscodeWorkspaceFolderLike> | undefined;
  readonly getConfiguration: (section?: string | undefined) => VscodeWorkspaceConfigurationLike;
};

export class SettingsProvider {
  constructor(workspace: VscodeWorkspaceLike) {
    this.workspace = workspace;
  }

  get settings(): Settings {
    if (!this.workspace.workspaceFolders)
      throw new Error('A workspace must be loaded to get coverage information.');

    const workspaceSettings = this.workspace.getConfiguration(definitions.extensionId);
    const workspaceFolders = this.workspace.workspaceFolders as Array<VscodeWorkspaceFolderLike>;
    const rootDirectory = workspaceFolders[0].uri.fsPath;

    return new Settings(
      workspaceSettings.get('cmakeCommand') as string,
      workspaceSettings.get('buildTreeDirectory') as string,
      workspaceSettings.get('cmakeTarget') as string,
      workspaceSettings.get('coverageInfoFileName') as string,
      rootDirectory,
      workspaceSettings.get('additionalCmakeOptions') as Array<string>
    );
  }

  private readonly workspace: VscodeWorkspaceLike;
}
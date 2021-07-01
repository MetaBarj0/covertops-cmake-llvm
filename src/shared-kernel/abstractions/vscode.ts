// TODO: File system - change hierrarchie to domain/(abstractions|implementations)
import { Settings } from "../../modules/settings-provider/domain/abstractions/settings";

export type VscodeWorkspaceLike = {
  readonly workspaceFolders: ReadonlyArray<VscodeWorkspaceFolderLike> | undefined;
  getConfiguration(section?: string | undefined): VscodeWorkspaceConfigurationLike;
};

export type VscodeWorkspaceFolderLike = {
  readonly uri: VscodeUriLike;
};

export type VscodeWorkspaceConfigurationLike = {
  get(section: keyof Settings): Settings[typeof section];
  update(section: string, value: any): Thenable<void>;
};

export type VscodeUriLike = {
  readonly fsPath: string;
};

export type OutputChannelLike = {
  appendLine(line: string): void;
};

export type ProgressLike = {
  report(value: ProgressStep): void;
};

// TODO: export and use
type ProgressStep = {
  message?: string,
  increment?: number
};
import { Settings } from "../../../modules/abstractions/settings-provider/settings";
import { TextDocumentContentProviderLike } from "./text-document-content-provider";

import * as vscode from "vscode";

export type VscodeWorkspaceLike = {
  readonly workspaceFolders: ReadonlyArray<VscodeWorkspaceFolderLike> | undefined;
  getConfiguration(section?: string | undefined): VscodeWorkspaceConfigurationLike;
  registerTextDocumentContentProvider(scheme: string, provider: TextDocumentContentProviderLike): vscode.Disposable;
};

export type VscodeWorkspaceFolderLike = {
  readonly uri: VscodeUriLike;
};

export type VscodeWorkspaceConfigurationLike = {
  get(section: keyof Settings): Settings[typeof section];
  update(section: string, value: unknown): Thenable<void>;
};

export type VscodeUriLike = {
  readonly fsPath: string;
};

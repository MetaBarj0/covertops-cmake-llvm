import { Settings } from "../../../modules/abstractions/settings-provider/settings";
import { TextDocumentContentProviderLike } from "./text-document-content-provider";

import * as vscode from "vscode";

export type WorkspaceLike = {
  readonly workspaceFolders: ReadonlyArray<WorkspaceFolderLike> | undefined;
  getConfiguration(section?: string | undefined): WorkspaceConfigurationLike;
  registerTextDocumentContentProvider(scheme: string, provider: TextDocumentContentProviderLike): vscode.Disposable;
};

export type WorkspaceFolderLike = {
  readonly uri: UriLike;
};

export type WorkspaceConfigurationLike = {
  get(section: keyof Settings): Settings[typeof section];
  update(section: string, value: unknown): Thenable<void>;
};

export type UriLike = {
  readonly fsPath: string;
};

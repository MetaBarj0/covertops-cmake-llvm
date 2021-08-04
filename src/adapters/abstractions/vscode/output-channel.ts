// TODO: split this one!
import { Settings } from "../../../modules/abstractions/settings-provider/settings";

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

export type OutputChannelLike = {
  appendLine(line: string): void;
  dispose(): void;
  clear(): void;
  show(preserveFocus: boolean): void;
};

type WithLines = {
  get lines(): ReadonlyArray<string>;
}

export type OutputChannelLikeWithLines = OutputChannelLike & WithLines;

export type ProgressLike = {
  report(value: ProgressStep): void;
};

export type ProgressStep = {
  message?: string,
  increment?: number
};

export type TextDocumentContentProviderLike = {
  provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string>;
};

export type DisposableLike = {
  dispose(): unknown;
};

// TODO: this type may be hidden
export type TextEditorLike = {
  setDecorations(decorationType: vscode.TextEditorDecorationType,
    rangesOrOptions: readonly vscode.Range[] | readonly vscode.DecorationOptions[]): void;

  readonly document: vscode.TextDocument;
}

export type Decorations = {
  decorationType: vscode.TextEditorDecorationType,
  rangesOrOptions: ReadonlyArray<vscode.Range> | ReadonlyArray<vscode.DecorationOptions>
};

type WithDecorations = {
  get decorations(): Decorations | undefined;
  refreshDecorations(): void;
};

export type UncoveredCodeRegionsVirtualTextEditor = TextEditorLike & WithDecorations;

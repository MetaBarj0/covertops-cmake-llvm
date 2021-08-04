import * as vscode from "vscode";

export type TextDocumentContentProviderLike = {
  provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string>;
};

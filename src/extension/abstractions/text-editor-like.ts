import * as vscode from "vscode";

export type TextEditorLike = {
  setDecorations(decorationType: vscode.TextEditorDecorationType,
    rangesOrOptions: readonly vscode.Range[] | readonly vscode.DecorationOptions[]): void;

  readonly document: vscode.TextDocument;
}

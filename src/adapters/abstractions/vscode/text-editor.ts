import * as vscode from "vscode";

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
  outdateDecorationsWith(decorationType: vscode.TextEditorDecorationType): void;
};

export type UncoveredCodeRegionsVirtualTextEditor = TextEditorLike & WithDecorations;

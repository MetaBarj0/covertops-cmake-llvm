import * as vscode from "vscode";

export type Decorations = {
  decorationType: vscode.TextEditorDecorationType,
  rangesOrOptions: ReadonlyArray<vscode.Range> | ReadonlyArray<vscode.DecorationOptions>
};

type WithDecorations = {
  get decorations(): Decorations | undefined;
};

export type UncoveredCodeRegionsVirtualTextEditor = vscode.TextEditor & WithDecorations;

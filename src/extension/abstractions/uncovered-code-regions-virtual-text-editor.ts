import * as vscode from "vscode";
import { TextEditorLike } from "./text-editor-like";

export type Decorations = {
  decorationType: vscode.TextEditorDecorationType,
  rangesOrOptions: ReadonlyArray<vscode.Range> | ReadonlyArray<vscode.DecorationOptions>
};

type WithDecorations = {
  get decorations(): Decorations | undefined;
  refreshDecorations(): void;
};

export type UncoveredCodeRegionsVirtualTextEditor = TextEditorLike & WithDecorations;

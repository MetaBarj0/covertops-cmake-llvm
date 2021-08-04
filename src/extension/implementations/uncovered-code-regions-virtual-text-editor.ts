// TODO: move to adapters implementations
import * as Types from "../types";

import * as vscode from "vscode";

export function make(textEditor: Types.Extension.TextEditorLike): Types.Extension.UncoveredCodeRegionsVirtualTextEditor {
  return new UncoveredCodeRegionsVirtualTextEditor(textEditor);
}

class UncoveredCodeRegionsVirtualTextEditor implements Types.Extension.UncoveredCodeRegionsVirtualTextEditor {
  constructor(textEditor: Types.Extension.TextEditorLike) {
    this.document = textEditor.document;
  }

  readonly document: vscode.TextDocument;

  get decorations(): Types.Extension.Decorations | undefined {
    return this.decorations_;
  }

  setDecorations(decorationType: vscode.TextEditorDecorationType,
    rangesOrOptions: readonly vscode.Range[] | readonly vscode.DecorationOptions[]): void {
    if (!vscode.window.activeTextEditor)
      return;

    vscode.window.activeTextEditor.setDecorations(decorationType, rangesOrOptions);

    this.decorations_ = {
      decorationType: decorationType,
      rangesOrOptions
    };
  }

  refreshDecorations(): void {
    if (!this.decorations)
      return;

    vscode.window.activeTextEditor?.setDecorations(this.decorations.decorationType, this.decorations.rangesOrOptions);
  }

  private decorations_?: Types.Extension.Decorations;
}

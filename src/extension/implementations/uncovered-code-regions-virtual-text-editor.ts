import * as Types from "../types";

import * as vscode from "vscode";

export class UncoveredCodeRegionsVirtualTextEditor implements Types.Extension.UncoveredCodeRegionsVirtualTextEditor {
  constructor(textEditor: Types.Extension.TextEditorLike) {
    this.textEditor = textEditor;
    this.document = textEditor.document;
  }

  readonly document: vscode.TextDocument;

  get decorations(): Types.Extension.Decorations | undefined {
    return this.decorations_;
  }

  setDecorations(decorationType: vscode.TextEditorDecorationType,
    rangesOrOptions: readonly vscode.Range[] | readonly vscode.DecorationOptions[]): void {
    this.textEditor.setDecorations(decorationType, rangesOrOptions);

    this.decorations_ = {
      decorationType: decorationType,
      rangesOrOptions
    };
  }

  refreshDecorations(): void {
  }

  private readonly textEditor: Types.Extension.TextEditorLike;
  private decorations_?: Types.Extension.Decorations;
}

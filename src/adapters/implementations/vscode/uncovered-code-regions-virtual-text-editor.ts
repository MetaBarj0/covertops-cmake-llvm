// TODO: move to extension module
import * as Types from "../../../types";

import * as vscode from "vscode";

export function make(textEditor: Types.Modules.Extension.TextEditorLike): Types.Modules.Extension.UncoveredCodeRegionsVirtualTextEditor {
  return new UncoveredCodeRegionsVirtualTextEditor(textEditor);
}

class UncoveredCodeRegionsVirtualTextEditor implements Types.Modules.Extension.UncoveredCodeRegionsVirtualTextEditor {
  constructor(textEditor: Types.Modules.Extension.TextEditorLike) {
    this.document = textEditor.document;
    this.textEditor = textEditor;
  }

  readonly document: vscode.TextDocument;

  get decorations() {
    return this.decorations_;
  }

  setDecorations(decorationType: vscode.TextEditorDecorationType,
    rangesOrOptions: readonly vscode.Range[] | readonly vscode.DecorationOptions[]) {
    if (!vscode.window.activeTextEditor)
      return;

    if (this.decorations_)
      vscode.window.activeTextEditor.setDecorations(this.decorations_.decorationType, []);

    vscode.window.activeTextEditor.setDecorations(decorationType, rangesOrOptions);

    this.decorations_ = {
      decorationType: decorationType,
      rangesOrOptions
    };
  }

  refreshDecorations() {
    if (!this.decorations_)
      return;

    vscode.window.activeTextEditor?.setDecorations(this.decorations_.decorationType, this.decorations_.rangesOrOptions);
  }

  outdateDecorationsWith(decorationType: vscode.TextEditorDecorationType) {
    if (!this.decorations_)
      return;

    const oldDecorationsRangesOrOptions = this.decorations_.rangesOrOptions;

    this.textEditor.setDecorations(this.decorations_.decorationType, []);

    this.decorations_ = {
      decorationType,
      rangesOrOptions: oldDecorationsRangesOrOptions
    };

    this.textEditor.setDecorations(decorationType, oldDecorationsRangesOrOptions);
  }

  private decorations_?: Types.Modules.Extension.Decorations;
  private textEditor: Types.Modules.Extension.TextEditorLike;
}

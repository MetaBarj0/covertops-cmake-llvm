import * as Types from "../../../types";

import * as Strings from "../../../strings";

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

    const outdatedOptions = (<ReadonlyArray<vscode.DecorationOptions>>this.decorations_.rangesOrOptions).map(option => {
      return {
        range: option.range,
        hoverMessage: Strings.decorationOutdatedCodeRegionHoverMessage
      };
    });

    this.textEditor.setDecorations(this.decorations_.decorationType, []);

    this.decorations_ = {
      decorationType,
      rangesOrOptions: outdatedOptions
    };

    this.textEditor.setDecorations(decorationType, outdatedOptions);
  }

  private decorations_?: Types.Modules.Extension.Decorations;
  private textEditor: Types.Modules.Extension.TextEditorLike;
}

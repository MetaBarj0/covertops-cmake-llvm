import * as Types from "../types";

import * as vscode from "vscode";

export class UncoveredCodeRegionsVirtualTextEditor implements Types.Extension.UncoveredCodeRegionsVirtualTextEditor {
  constructor(textEditor: vscode.TextEditor) {
    this.textEditor = textEditor;
    this.document = textEditor.document;
    this.selection = textEditor.selection;
    this.selections = textEditor.selections;
    this.visibleRanges = textEditor.visibleRanges;
    this.options = textEditor.options;
    this.viewColumn = textEditor.viewColumn;

    this.edit = textEditor.edit;
    this.insertSnippet = textEditor.insertSnippet;
    this.revealRange = textEditor.revealRange;
    this.show = textEditor.show;
    this.hide = textEditor.hide;
  }

  readonly document: vscode.TextDocument;
  selection: vscode.Selection;
  selections: vscode.Selection[];
  readonly visibleRanges: vscode.Range[];
  options: vscode.TextEditorOptions;
  readonly viewColumn?: vscode.ViewColumn | undefined;

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

  edit: (callback: (editBuilder: vscode.TextEditorEdit) => void,
    options?: { undoStopBefore: boolean; undoStopAfter: boolean; }) => Thenable<boolean>;
  insertSnippet: (snippet: vscode.SnippetString,
    location?: vscode.Range | vscode.Position | readonly vscode.Position[] | readonly vscode.Range[],
    options?: { undoStopBefore: boolean; undoStopAfter: boolean; }) => Thenable<boolean>;
  revealRange: (range: vscode.Range,
    revealType?: vscode.TextEditorRevealType) => void;
  show: (column?: vscode.ViewColumn) => void;
  hide: () => void;

  private readonly textEditor: vscode.TextEditor;
  private decorations_?: Types.Extension.Decorations;
}

import * as Types from "../types";

import * as vscode from "vscode";

export class UncoveredCodeRegionsVirtualTextEditor implements Types.Extension.UncoveredCodeRegionsVirtualTextEditor {
  constructor(textEditor: vscode.TextEditor) {
    // TODO: (heavy) TextEditorLike facade
    this.textEditor = textEditor;
    this.document = textEditor.document;
    this.selection = textEditor.selection;
    this.selections = textEditor.selections;
    this.visibleRanges = textEditor.visibleRanges;
    this.options = textEditor.options;
    this.viewColumn = textEditor.viewColumn;
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

  refreshDecorations(): void {
  }

  edit(callback: (editBuilder: vscode.TextEditorEdit) => void, options?: { undoStopBefore: boolean; undoStopAfter: boolean; }): Thenable<boolean> {
    return this.textEditor.edit(callback, options);
  }

  insertSnippet(snippet: vscode.SnippetString, location?: vscode.Range | vscode.Position | readonly vscode.Range[] | readonly vscode.Position[], options?: { undoStopBefore: boolean; undoStopAfter: boolean; }): Thenable<boolean> {
    return this.textEditor.insertSnippet(snippet, location, options);
  }

  revealRange(range: vscode.Range, revealType?: vscode.TextEditorRevealType): void {
    return this.textEditor.revealRange(range, revealType);
  }

  show(column?: vscode.ViewColumn): void {
    return this.textEditor.show(column);
  }

  hide(): void {
    return this.textEditor.hide();
  }

  private readonly textEditor: vscode.TextEditor;
  private decorations_?: Types.Extension.Decorations;
}

import * as Types from "../../../src/extension/types";

import { UncoveredCodeRegionsVirtualTextEditor } from "../../../src/extension/abstractions/uncovered-code-regions-virtual-text-editor";
import { Spy } from "../../utils/spy";
import { SpyEventEmitterFor } from "../../utils/spy-event-emitter-for";

import * as vscode from "vscode";

export function buildEventBasedSpyForUncoveredCodeRegionsVirtualTextEditor(options: {
  uncoveredCodeRegionsVirtualTextEditor: UncoveredCodeRegionsVirtualTextEditor,
  eventForSpy: SpyEventEmitterFor<UncoveredCodeRegionsVirtualTextEditor>
}): Spy<UncoveredCodeRegionsVirtualTextEditor> {
  return new class extends Spy<Types.Extension.UncoveredCodeRegionsVirtualTextEditor> implements Types.Extension.UncoveredCodeRegionsVirtualTextEditor {
    constructor(wrapped: Types.Extension.UncoveredCodeRegionsVirtualTextEditor, eventForSpy: SpyEventEmitterFor<UncoveredCodeRegionsVirtualTextEditor>) {
      super(wrapped, eventForSpy);

      this.document = wrapped.document;
      this.selection = wrapped.selection;
      this.selections = wrapped.selections;
      this.visibleRanges = wrapped.visibleRanges;
      this.options = wrapped.options;
      this.viewColumn = wrapped.viewColumn;
    }

    refreshDecorations(): void {
      this.wrapped.refreshDecorations();

      this.incrementCallCountFor("refreshDecorations");
    }

    get object(): Types.Extension.UncoveredCodeRegionsVirtualTextEditor {
      return this;
    }

    // TODO: (heavy) is it possible to create an adapter to only bother about setDecorations?
    edit(callback: (editBuilder: vscode.TextEditorEdit) => void, options?: { undoStopBefore: boolean; undoStopAfter: boolean; }): Thenable<boolean> {
      return this.wrapped.edit(callback, options);
    }

    insertSnippet(snippet: vscode.SnippetString, location?: vscode.Range | vscode.Position | readonly vscode.Range[] | readonly vscode.Position[], options?: { undoStopBefore: boolean; undoStopAfter: boolean; }): Thenable<boolean> {
      return this.wrapped.insertSnippet(snippet, location, options);
    }

    setDecorations(decorationType: vscode.TextEditorDecorationType, rangesOrOptions: readonly vscode.Range[] | readonly vscode.DecorationOptions[]): void {
      return this.wrapped.setDecorations(decorationType, rangesOrOptions);
    }

    revealRange(range: vscode.Range, revealType?: vscode.TextEditorRevealType): void {
      return this.wrapped.revealRange(range, revealType);
    }

    show(column?: vscode.ViewColumn): void {
      return this.wrapped.show(column);
    }

    hide(): void {
      return this.wrapped.hide();
    }

    get decorations() {
      return this.wrapped.decorations;
    }

    document: vscode.TextDocument;
    selection: vscode.Selection;
    selections: vscode.Selection[];
    visibleRanges: vscode.Range[];
    options: vscode.TextEditorOptions;
    viewColumn?: vscode.ViewColumn | undefined;
  }(options.uncoveredCodeRegionsVirtualTextEditor, options.eventForSpy);
}

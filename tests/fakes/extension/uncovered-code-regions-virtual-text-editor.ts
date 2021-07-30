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
    }

    refreshDecorations(): void {
      this.wrapped.refreshDecorations();

      this.incrementCallCountFor("refreshDecorations");
    }

    get object(): Types.Extension.UncoveredCodeRegionsVirtualTextEditor {
      return this;
    }

    setDecorations(decorationType: vscode.TextEditorDecorationType, rangesOrOptions: readonly vscode.Range[] | readonly vscode.DecorationOptions[]): void {
      return this.wrapped.setDecorations(decorationType, rangesOrOptions);
    }

    get decorations() {
      return this.wrapped.decorations;
    }

    document: vscode.TextDocument;
  }(options.uncoveredCodeRegionsVirtualTextEditor, options.eventForSpy);
}

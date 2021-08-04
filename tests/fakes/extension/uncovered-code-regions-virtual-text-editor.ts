import * as Types from "../../../src/extension/types";

import { Spy } from "../../utils/spy";
import { SpyEventEmitterFor } from "../../utils/spy-event-emitter-for";

import * as vscode from "vscode";

export function buildEventBasedSpyForUncoveredCodeRegionsVirtualTextEditor(options: {
  uncoveredCodeRegionsVirtualTextEditor: Types.Adapters.vscode.UncoveredCodeRegionsVirtualTextEditor,
  eventForSpy: SpyEventEmitterFor<Types.Adapters.vscode.UncoveredCodeRegionsVirtualTextEditor>
}): Spy<Types.Adapters.vscode.UncoveredCodeRegionsVirtualTextEditor> {
  return new class extends Spy<Types.Extension.UncoveredCodeRegionsVirtualTextEditor> implements Types.Extension.UncoveredCodeRegionsVirtualTextEditor {
    constructor(wrapped: Types.Extension.UncoveredCodeRegionsVirtualTextEditor, eventForSpy: SpyEventEmitterFor<Types.Adapters.vscode.UncoveredCodeRegionsVirtualTextEditor>) {
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

import * as Types from "../../../src/types";

import { Spy } from "../../utils/spy";
import { SpyEventEmitterFor } from "../../utils/spy-event-emitter-for";

import * as vscode from "vscode";

export function buildEventBasedSpyForUncoveredCodeRegionsVirtualTextEditor(options: {
  uncoveredCodeRegionsVirtualTextEditor: Types.Modules.Extension.UncoveredCodeRegionsVirtualTextEditor,
  eventForSpy: SpyEventEmitterFor<Types.Modules.Extension.UncoveredCodeRegionsVirtualTextEditor>
}): Spy<Types.Modules.Extension.UncoveredCodeRegionsVirtualTextEditor> {
  return new class extends Spy<Types.Modules.Extension.UncoveredCodeRegionsVirtualTextEditor> implements Types.Modules.Extension.UncoveredCodeRegionsVirtualTextEditor {
    constructor(wrapped: Types.Modules.Extension.UncoveredCodeRegionsVirtualTextEditor, eventForSpy: SpyEventEmitterFor<Types.Modules.Extension.UncoveredCodeRegionsVirtualTextEditor>) {
      super(wrapped, eventForSpy);

      this.document = wrapped.document;
    }

    refreshDecorations(): void {
      this.wrapped.refreshDecorations();

      this.incrementCallCountFor("refreshDecorations");
    }

    get object(): Types.Modules.Extension.UncoveredCodeRegionsVirtualTextEditor {
      return this;
    }

    setDecorations(decorationType: vscode.TextEditorDecorationType, rangesOrOptions: readonly vscode.Range[] | readonly vscode.DecorationOptions[]): void {
      return this.wrapped.setDecorations(decorationType, rangesOrOptions);
    }

    get decorations() {
      return this.wrapped.decorations;
    }

    outdateDecorationsWith(decorationType: vscode.TextEditorDecorationType) {
      this.wrapped.outdateDecorationsWith(decorationType);

      this.incrementCallCountFor("outdateDecorationsWith");
    }

    document: vscode.TextDocument;
  }(options.uncoveredCodeRegionsVirtualTextEditor, options.eventForSpy);
}

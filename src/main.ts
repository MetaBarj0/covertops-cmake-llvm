import * as vscode from "vscode";

import * as CovertOps from "./extension/implementations/covert-ops";
import * as UncoveredCodeRegionsDocumentContentProvider from "./extension/implementations/uncovered-code-regions-document-content-provider";
import * as UncoveredCodeRegionsVirtualTextEditorFactory from "./extension/factories/uncovered-code-regions-virtual-text-editor";

export function activate(context: vscode.ExtensionContext): void {
  const covertOps = CovertOps.make({
    uncoveredCodeRegionsDocumentContentProvider: UncoveredCodeRegionsDocumentContentProvider.make(),
    uncoveredCodeRegionsVirtualTextEditorFactory: UncoveredCodeRegionsVirtualTextEditorFactory.make()
  });

  context.subscriptions.push(covertOps.asDisposable);
}

export function deactivate(): void { }

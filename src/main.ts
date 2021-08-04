import * as vscode from "vscode";

import * as CovertOps from "./extension/implementations/covert-ops";
import * as UncoveredCodeRegionsDocumentContentProvider from "./extension/implementations/uncovered-code-regions-document-content-provider";
import * as UncoveredCodeRegionsVirtualTextEditorFactory from "./factories/uncovered-code-regions-virtual-text-editor";
import * as Definitions from "./definitions";

export function activate(context: vscode.ExtensionContext): void {
  const covertOps = CovertOps.make({
    uncoveredCodeRegionsDocumentContentProvider: UncoveredCodeRegionsDocumentContentProvider.make(),
    uncoveredCodeRegionsVirtualTextEditorFactory: UncoveredCodeRegionsVirtualTextEditorFactory.make(),
    outputChannel: vscode.window.createOutputChannel(Definitions.extensionId)
  });

  context.subscriptions.push(covertOps.asDisposable);
}

export function deactivate(): void { }

import * as vscode from "vscode";

import * as CovertOps from "./extension/implementations/covert-ops";
import * as UncoveredCodeRegionsDocumentContentProvider from "./extension/implementations/uncovered-code-regions-document-content-provider";
import * as UncoveredCodeRegionsVirtualTextEditor from "./extension/factories/uncovered-code-regions-virtual-text-editor";

export function activate(context: vscode.ExtensionContext): void {
  const covertOps = CovertOps.make(UncoveredCodeRegionsDocumentContentProvider.make(), UncoveredCodeRegionsVirtualTextEditor.make());

  context.subscriptions.push(covertOps.asDisposable);
}

export function deactivate(): void { }

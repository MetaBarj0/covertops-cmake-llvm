import * as vscode from "vscode";

import * as Cov from "./extension/implementations/cov";
import * as UncoveredCodeRegionsDocumentContentProvider from "./extension/implementations/uncovered-code-regions-document-content-provider";
import * as UncoveredCodeRegionsVirtualTextEditor from "./extension/factories/uncovered-code-regions-virtual-text-editor";

export function activate(context: vscode.ExtensionContext): void {
  const cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make(), UncoveredCodeRegionsVirtualTextEditor.make());

  context.subscriptions.push(cov.asDisposable);
}

export function deactivate(): void { }

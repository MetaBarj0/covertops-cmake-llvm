import * as vscode from "vscode";

import * as Cov from "./extension/implementations/cov";
import * as UncoveredCodeRegionsDocumentContentProvider from "./extension/implementations/uncovered-code-regions-document-content-provider";

export function activate(context: vscode.ExtensionContext): void {
  const uncoveredCodeRegionsDocumentContentProvider = UncoveredCodeRegionsDocumentContentProvider.make();

  const cov = Cov.make(uncoveredCodeRegionsDocumentContentProvider);

  context.subscriptions.push(cov.asDisposable);
}

export function deactivate(): void { }

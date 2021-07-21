import * as vscode from 'vscode';

import * as Cov from './extension/cov';
import * as UncoveredCodeRegionsDocumentContentProvider from './extension/uncovered-code-regions-document-content-provider';

export async function activate(context: vscode.ExtensionContext) {
  const uncoveredCodeRegionsDocumentContentProvider = UncoveredCodeRegionsDocumentContentProvider.make();

  const cov = Cov.make(uncoveredCodeRegionsDocumentContentProvider);

  context.subscriptions.push(cov.asDisposable);
}

export function deactivate() { }

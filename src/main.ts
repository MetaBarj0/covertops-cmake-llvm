import * as vscode from 'vscode';

import * as Cov from './extension/cov';
import * as decorationLocationsProvider from './extension/factories/decoration-locations-provider';
import * as UncoveredCodeRegionsDocumentContentProvider from './extension/uncovered-code-regions-document-content-provider';

export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(Cov.make(await decorationLocationsProvider.make(),
    UncoveredCodeRegionsDocumentContentProvider.make()).asDisposable);
}

export function deactivate() { }

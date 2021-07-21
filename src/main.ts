import * as vscode from 'vscode';

import * as Cov from './extension/cov';
import * as UncoveredCodeRegionsDocumentContentProvider from './extension/uncovered-code-regions-document-content-provider';
import * as DecorationLocationsProvider from './extension/factories/decoration-locations-provider';

export async function activate(context: vscode.ExtensionContext) {
  const uncoveredCodeRegionsDocumentContentProvider = UncoveredCodeRegionsDocumentContentProvider.make();
  // TODO: rename from DecorationLocationsProvider to CoverageInfoProvider
  const decorationLocationsProvider = await DecorationLocationsProvider.make();

  const cov = Cov.make(uncoveredCodeRegionsDocumentContentProvider, decorationLocationsProvider);

  context.subscriptions.push(cov.asDisposable);
}

export function deactivate() { }

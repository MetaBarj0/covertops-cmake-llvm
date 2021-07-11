import * as Definitions from './definitions';

import * as vscode from 'vscode';

export function make(): vscode.Disposable {
  return vscode.workspace.registerTextDocumentContentProvider(Definitions.extensionId, new UncoveredCodeRegionsDocumentContentProvider());
}

class UncoveredCodeRegionsDocumentContentProvider implements vscode.TextDocumentContentProvider {
  provideTextDocumentContent(_uri: vscode.Uri, _token: vscode.CancellationToken): vscode.ProviderResult<string> {
    throw new Error('Method not implemented.');
  }
}
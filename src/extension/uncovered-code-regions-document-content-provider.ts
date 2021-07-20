import * as vscode from 'vscode';

export function make() {
  return new UncoveredCodeRegionsDocumentContentProvider();
}

class UncoveredCodeRegionsDocumentContentProvider implements vscode.TextDocumentContentProvider {
  provideTextDocumentContent(_uri: vscode.Uri, _token: vscode.CancellationToken): vscode.ProviderResult<string> {
    return '';
  }
}
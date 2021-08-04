// TODO: move to adapters implementations
import * as vscode from "vscode";
import * as fs from "fs/promises";

export function make(): vscode.TextDocumentContentProvider {
  return new UncoveredCodeRegionsDocumentContentProvider();
}

class UncoveredCodeRegionsDocumentContentProvider implements vscode.TextDocumentContentProvider {
  async provideTextDocumentContent(uri: vscode.Uri, _token: vscode.CancellationToken) {
    const content = await fs.readFile(uri.fsPath);

    return content.toString();
  }
}

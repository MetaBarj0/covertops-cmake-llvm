import * as Definitions from './definitions';

import * as vscode from 'vscode';

export function make(uncoveredCodeRegionsDocumentContentProvider: vscode.TextDocumentContentProvider) {
  return new Cov(uncoveredCodeRegionsDocumentContentProvider);
}

class Cov {
  constructor(uncoveredCodeRegionsDocumentContentProvider: vscode.TextDocumentContentProvider) {
    this.output = vscode.window.createOutputChannel(Definitions.extensionId);
    this.command = vscode.commands.registerCommand(`${Definitions.extensionId}.reportUncoveredCodeRegionsInFile`, this.run, this);
    this.textDocumentProvider = vscode.workspace.registerTextDocumentContentProvider(Definitions.extensionId, uncoveredCodeRegionsDocumentContentProvider);
    this.openedUncoveredCodeRegionsDocuments = [];
  }

  get asDisposable() {
    return vscode.Disposable.from(this);
  }

  get outputChannel() {
    return this.output;
  }

  dispose() {
    [
      this.output,
      this.command,
      this.textDocumentProvider
    ].forEach(disposable => disposable.dispose());
  }

  async run() {
    this.reportStartInOutputChannel();
  }

  get uncoveredCodeRegionsEditors(): ReadonlyArray<vscode.TextDocument> {
    return this.openedUncoveredCodeRegionsDocuments;
  }

  get uncoveredCodeRegionsDocumentProvider() {
    return this.textDocumentProvider;
  }

  private reportStartInOutputChannel() {
    this.output.show(false);
    this.output.clear();
    this.output.appendLine(`starting ${Definitions.extensionDisplayName}`);
  }

  private readonly output: vscode.OutputChannel;
  private readonly command: vscode.Disposable;
  private readonly textDocumentProvider: vscode.Disposable;
  private readonly openedUncoveredCodeRegionsDocuments: Array<vscode.TextDocument>;
}

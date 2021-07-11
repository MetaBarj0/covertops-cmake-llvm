// TODO: perhaps not necessary anymore
import * as Imports from './imports';

import * as vscode from 'vscode';

export function make(decorationLocationsProvider: Imports.Domain.Abstractions.DecorationLocationsProvider,
  uncoveredCodeRegionsDocumentContentProvider: vscode.Disposable) {
  return new Cov(decorationLocationsProvider, uncoveredCodeRegionsDocumentContentProvider);
}

class Cov {
  constructor(decorationLocationsProvider: Imports.Domain.Abstractions.DecorationLocationsProvider,
    uncoveredCodeRegionsDocumentContentProvider: vscode.Disposable) {
    this.output = vscode.window.createOutputChannel(Imports.Extension.Definitions.extensionId);
    this.command = vscode.commands.registerCommand(`${Imports.Extension.Definitions.extensionId}.reportUncoveredCodeRegionsInFile`, this.run, this);
    this.textDocumentProvider = uncoveredCodeRegionsDocumentContentProvider;
    this.decorationLocationsProvider = decorationLocationsProvider;
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

  get uncoveredCodeRegionsEditors(): ReadonlyArray<vscode.TextEditor> {
    return [];
  }

  get uncoveredCodeRegionsDocumentProvider() {
    return this.textDocumentProvider;
  }

  private reportStartInOutputChannel() {
    this.output.show(false);
    this.output.clear();
    this.output.appendLine(`starting ${Imports.Extension.Definitions.extensionDisplayName}`);
  }

  private readonly output: vscode.OutputChannel;
  private readonly command: vscode.Disposable;
  private readonly textDocumentProvider: vscode.Disposable;
  // TODO: not used here, maybe misplaced?
  private readonly decorationLocationsProvider: Imports.Domain.Abstractions.DecorationLocationsProvider;
}

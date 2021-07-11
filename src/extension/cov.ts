import * as Imports from './imports';

import * as vscode from 'vscode';

export function make(decorationLocationsProvider: Imports.Domain.Abstractions.DecorationLocationsProvider) {
  return new Cov(decorationLocationsProvider);
}

class Cov {
  constructor(decorationLocationsProvider: Imports.Domain.Abstractions.DecorationLocationsProvider) {
    this.output = vscode.window.createOutputChannel(Imports.Extension.Definitions.extensionId);
    this.command = vscode.commands.registerCommand(`${Imports.Extension.Definitions.extensionId}.reportUncoveredCodeRegionsInFile`, this.run, this);
    this.textDocumentProvider = this.createUncoveredCodeRegionsDocumentProvider();
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

  private createUncoveredCodeRegionsDocumentProvider() {
    // TODO: new named class in a new file, keep cov dumb
    const documentContentProvider = new class implements vscode.TextDocumentContentProvider {
      provideTextDocumentContent(_uri: vscode.Uri, _token: vscode.CancellationToken): vscode.ProviderResult<string> {
        throw new Error('Method not implemented.');
      }
    };

    return vscode.workspace.registerTextDocumentContentProvider(Imports.Extension.Definitions.extensionId, documentContentProvider);
  }

  private reportStartInOutputChannel() {
    this.output.show(false);
    this.output.clear();
    this.output.appendLine(`starting ${Imports.Extension.Definitions.extensionDisplayName}`);
  }

  // TODO: move close to document provider
  private async getCoverageInfoForFile(path: string) {
    return await this.decorationLocationsProvider.getDecorationLocationsForUncoveredCodeRegions(path);
  }

  private readonly output: vscode.OutputChannel;
  private readonly command: vscode.Disposable;
  private readonly textDocumentProvider: vscode.Disposable;
  private readonly decorationLocationsProvider: Imports.Domain.Abstractions.DecorationLocationsProvider;
}

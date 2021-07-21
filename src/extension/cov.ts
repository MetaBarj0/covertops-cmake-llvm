import * as Definitions from './definitions';
import { TextEditorWithDecorations } from './abstractions/text-editor-with-decorations';
import { TextEditorWithDecorations as ConcreteTextEditorWithDecorations } from './implementations/text-editor-with-decorations';

import * as vscode from 'vscode';

export function make(uncoveredCodeRegionsDocumentContentProvider: vscode.TextDocumentContentProvider) {
  return new Cov(uncoveredCodeRegionsDocumentContentProvider);
}

class Cov {
  constructor(uncoveredCodeRegionsDocumentContentProvider: vscode.TextDocumentContentProvider) {
    this.output = vscode.window.createOutputChannel(Definitions.extensionId);
    this.command = vscode.commands.registerCommand(`${Definitions.extensionId}.reportUncoveredCodeRegionsInFile`, this.run, this);
    this.textDocumentProvider = vscode.workspace.registerTextDocumentContentProvider(Definitions.extensionId, uncoveredCodeRegionsDocumentContentProvider);
    this.uncoveredCodeRegionsVirtualTextEditors_ = new Map<string, TextEditorWithDecorations>();
    this.decorationType_ = vscode.window.createTextEditorDecorationType({
      backgroundColor: {
        id: Definitions.uncoveredCodeRegionDecorationBackgroundColor
      }
    });
  }

  get asDisposable() {
    return vscode.Disposable.from(this);
  }

  get outputChannel() {
    return this.output;
  }

  dispose() {
    [
      vscode.Disposable.from(this.output),
      this.command,
      this.textDocumentProvider
    ].forEach(disposable => disposable.dispose());
  }

  async run() {
    this.reportStartInOutputChannel();

    const uri = this.buildVirtualDocumentUri();

    const virtualDocument = await vscode.workspace.openTextDocument(uri);
    const virtualTextEditor = await vscode.window.showTextDocument(virtualDocument, { preserveFocus: false });
    const uncoveredCodeRegionsVirtualTextEditor = new ConcreteTextEditorWithDecorations(virtualTextEditor);
    this.addUncoveredCodeRegionsVirtualEditorIfNotExist(uri, uncoveredCodeRegionsVirtualTextEditor);

    uncoveredCodeRegionsVirtualTextEditor.setDecorations(this.decorationType, []);
  }

  get uncoveredCodeRegionsVirtualTextEditors(): ReadonlyMap<string, TextEditorWithDecorations> {
    return this.uncoveredCodeRegionsVirtualTextEditors_;
  }

  get uncoveredCodeRegionsDocumentProvider() {
    return this.textDocumentProvider;
  }

  // maybe inject instead of take responsibility?
  get decorationType() {
    return this.decorationType_;
  }

  private reportStartInOutputChannel() {
    this.output.show(true);
    this.output.clear();
    this.output.appendLine(`starting ${Definitions.extensionDisplayName}`);
  }

  private buildVirtualDocumentUri() {
    return vscode.Uri.from({
      scheme: Definitions.extensionId,
      path: (<vscode.TextEditor>vscode.window.activeTextEditor).document.uri.path
    });
  }

  private addUncoveredCodeRegionsVirtualEditorIfNotExist(uri: vscode.Uri, doc: TextEditorWithDecorations) {
    if (!this.uncoveredCodeRegionsVirtualTextEditors_.has(uri.fsPath))
      this.uncoveredCodeRegionsVirtualTextEditors_.set(uri.fsPath, doc);
  }

  private readonly output: vscode.OutputChannel;
  private readonly command: vscode.Disposable;
  private readonly textDocumentProvider: vscode.Disposable;
  private readonly uncoveredCodeRegionsVirtualTextEditors_: Map<string, TextEditorWithDecorations>;
  private readonly decorationType_: vscode.TextEditorDecorationType;
}

import * as Types from "../types";

import * as Definitions from "./definitions";
import * as Strings from "../../strings";
import * as CoverageInfoProvider from "../factories/coverage-info-provider";

import * as vscode from "vscode";

export function make(context: Context): Types.Extension.CovertOps {
  return new CovertOps(context.uncoveredCodeRegionsDocumentContentProvider, context.uncoveredCodeRegionsVirtualTextEditorFactory);
}

class CovertOps implements Types.Extension.CovertOps {
  constructor(uncoveredCodeRegionsDocumentContentProvider: vscode.TextDocumentContentProvider,
    uncoveredCodeRegionsVirtualTextEditorFactory: UncoveredCodeRegionsVirtualTextEditorFactory) {
    this.outputChannel_ = vscode.window.createOutputChannel(Definitions.extensionId);
    this.command = vscode.commands.registerCommand(Strings.commandReportUncoveredCodeRegionsInFile, this.run, this);
    this.textDocumentProvider = vscode.workspace.registerTextDocumentContentProvider(Definitions.extensionId, uncoveredCodeRegionsDocumentContentProvider);
    this.uncoveredCodeRegionsVirtualTextEditors_ = new Map<string, Types.Extension.UncoveredCodeRegionsVirtualTextEditor>();
    this.decorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: {
        id: Definitions.uncoveredCodeRegionDecorationBackgroundColorId
      }
    });
    this.uncoveredCodeRegionsVirtualTextEditorFactory = uncoveredCodeRegionsVirtualTextEditorFactory;
    this.onDidChangeActiveTextEditorListenerDisposer = vscode.window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor, this);
  }

  get asDisposable() {
    return vscode.Disposable.from(this);
  }

  get outputChannel() {
    return this.outputChannel_;
  }

  dispose() {
    [
      vscode.Disposable.from(this.outputChannel_),
      this.command,
      this.textDocumentProvider,
      this.onDidChangeActiveTextEditorListenerDisposer
    ].forEach(disposable => disposable.dispose());
  }

  async run() {
    this.reportStartInOutputChannel();

    await this.displayUncoveredCodeRegions();
  }

  get uncoveredCodeRegionsVirtualTextEditors(): ReadonlyMap<string, Types.Extension.UncoveredCodeRegionsVirtualTextEditor> {
    return this.uncoveredCodeRegionsVirtualTextEditors_;
  }

  private async displayUncoveredCodeRegions() {
    const uri = this.buildVirtualDocumentUri();
    const uncoveredCodeRegionsVirtualTextEditor = await this.buildUncoveredCodeRegionsVirtualTextEditor(uri);
    const uncoveredCodeInfo: Types.Modules.CoverageInfo = await this.queryUncoveredCodeInfo(uri);
    const options: Array<vscode.DecorationOptions> = await this.buildDecorationOptions(uncoveredCodeInfo);

    uncoveredCodeRegionsVirtualTextEditor.setDecorations(this.decorationType, options);
  }

  private async buildDecorationOptions(uncoveredCodeInfo: Types.Modules.CoverageInfo) {
    const options: Array<vscode.DecorationOptions> = [];

    for await (const uncoveredRegion of uncoveredCodeInfo.uncoveredRegions)
      options.push({
        range: new vscode.Range(uncoveredRegion.range.start.line,
          uncoveredRegion.range.start.character,
          uncoveredRegion.range.end.line,
          uncoveredRegion.range.end.character),
        hoverMessage: Strings.decorationUncoveredCodeRegionHoverMessage
      });

    return options;
  }

  private queryUncoveredCodeInfo(uri: vscode.Uri) {
    return vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: Strings.progressComputingRegionsLocations,
      cancellable: false
    }, async progressReporter => {

      const coverageInfoProvider = CoverageInfoProvider.make({ progressReporter, outputChannel: this.outputChannel_ });

      try {
        return await coverageInfoProvider.getCoverageInfoForFile(uri.fsPath);
      } catch (error) {
        this.outputChannel_.appendLine(error.message);
        throw error;
      }
    });
  }

  private async buildUncoveredCodeRegionsVirtualTextEditor(uri: vscode.Uri) {
    const virtualDocument = await vscode.workspace.openTextDocument(uri);
    const virtualTextEditor = await vscode.window.showTextDocument(virtualDocument, { preserveFocus: false });
    const uncoveredCodeRegionsVirtualTextEditor = this.uncoveredCodeRegionsVirtualTextEditorFactory(virtualTextEditor);

    this.addUncoveredCodeRegionsVirtualEditorIfNotExist(uri, uncoveredCodeRegionsVirtualTextEditor);

    return uncoveredCodeRegionsVirtualTextEditor;
  }

  private reportStartInOutputChannel() {
    this.outputChannel_.show(true);
    this.outputChannel_.clear();
    this.outputChannel_.appendLine(Strings.reportExtensionStarting);
  }

  private buildVirtualDocumentUri() {
    return vscode.Uri.from({
      scheme: Definitions.extensionId,
      path: (<Types.Extension.TextEditorLike>vscode.window.activeTextEditor).document.uri.path
    });
  }

  private addUncoveredCodeRegionsVirtualEditorIfNotExist(uri: vscode.Uri, doc: Types.Extension.UncoveredCodeRegionsVirtualTextEditor) {
    if (!this.uncoveredCodeRegionsVirtualTextEditors_.has(uri.fsPath))
      this.uncoveredCodeRegionsVirtualTextEditors_.set(uri.fsPath, doc);
  }

  private onDidChangeActiveTextEditor(_textEditor?: Types.Extension.TextEditorLike) {
    const activeEditor = vscode.window.activeTextEditor;

    if (!activeEditor)
      return;

    const uri = activeEditor.document.uri;

    if (uri.scheme !== Definitions.extensionId)
      return;

    this.uncoveredCodeRegionsVirtualTextEditors.get(uri.fsPath)?.refreshDecorations();
  }

  private readonly outputChannel_: vscode.OutputChannel;
  private readonly command: vscode.Disposable;
  private readonly textDocumentProvider: vscode.Disposable;
  private readonly uncoveredCodeRegionsVirtualTextEditors_: Map<string, Types.Extension.UncoveredCodeRegionsVirtualTextEditor>;
  private readonly decorationType: vscode.TextEditorDecorationType;
  private readonly uncoveredCodeRegionsVirtualTextEditorFactory: UncoveredCodeRegionsVirtualTextEditorFactory;
  private readonly onDidChangeActiveTextEditorListenerDisposer: vscode.Disposable;
}

type UncoveredCodeRegionsVirtualTextEditorFactory = (textEditor: Types.Extension.TextEditorLike) => Types.Extension.UncoveredCodeRegionsVirtualTextEditor;

type Context = {
  uncoveredCodeRegionsDocumentContentProvider: vscode.TextDocumentContentProvider,
  uncoveredCodeRegionsVirtualTextEditorFactory: UncoveredCodeRegionsVirtualTextEditorFactory
}

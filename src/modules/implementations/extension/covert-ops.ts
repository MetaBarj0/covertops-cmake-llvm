import * as Types from "../../../types";

import * as Definitions from "../../../definitions";
import * as Strings from "../../../strings";
import * as CoverageInfoProvider from "../../../factories/coverage-info-provider";

import * as vscode from "vscode";

export function make(context: Context): Types.Modules.Extension.CovertOps {
  return new CovertOps(context.uncoveredCodeRegionsDocumentContentProvider, context.uncoveredCodeRegionsVirtualTextEditorFactory, context.outputChannel);
}

// TODO: refacto because of possible low cohesion
class CovertOps implements Types.Modules.Extension.CovertOps {
  constructor(uncoveredCodeRegionsDocumentContentProvider: vscode.TextDocumentContentProvider,
    uncoveredCodeRegionsVirtualTextEditorFactory: UncoveredCodeRegionsVirtualTextEditorFactory,
    outputChannel: Types.Adapters.Vscode.OutputChannelLikeWithLines) {
    this.outputChannel_ = outputChannel;
    this.command = vscode.commands.registerCommand(Strings.commandReportUncoveredCodeRegionsInFile, this.run, this);
    this.textDocumentProvider = vscode.workspace.registerTextDocumentContentProvider(Definitions.extensionId, uncoveredCodeRegionsDocumentContentProvider);
    this.uncoveredCodeRegionsVirtualTextEditors_ = new Map<string, Types.Modules.Extension.UncoveredCodeRegionsVirtualTextEditor>();
    this.decorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: {
        id: Definitions.uncoveredCodeRegionDecorationBackgroundColorId
      }
    });
    this.outdatedDecorationType = vscode.window.createTextEditorDecorationType({
      borderColor: {
        id: Definitions.outdatedUncoveredCodeRegionDecorationBackgroundColorId
      },
      border: Strings.decorationOutdatedBorderThickness
    });
    this.uncoveredCodeRegionsVirtualTextEditorFactory = uncoveredCodeRegionsVirtualTextEditorFactory;
    this.onDidChangeActiveTextEditorListenerDisposer = vscode.window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor, this);
    this.onDidChangeConfigurationListenerDisposer = vscode.workspace.onDidChangeConfiguration(this.onDidChangeConfiguration, this);
    this.onDidSaveTextDocumentListenerDisposer = vscode.workspace.onDidSaveTextDocument(this.onDidSaveTextDocument, this);
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
      this.onDidChangeActiveTextEditorListenerDisposer,
      this.onDidChangeConfigurationListenerDisposer,
      this.onDidSaveTextDocumentListenerDisposer
    ].forEach(disposable => disposable.dispose());
  }

  async run() {
    this.reportStartInOutputChannel();

    const { uri, uncoveredCodeInfo } = await this.queryUncoveredCodeInfo();

    await this.displayUncoveredCodeRegions(uri, uncoveredCodeInfo);
    await this.displaySummaryCoverageInfo(uri, uncoveredCodeInfo);
  }

  get uncoveredCodeRegionsVirtualTextEditors(): ReadonlyMap<string, Types.Modules.Extension.UncoveredCodeRegionsVirtualTextEditor> {
    return this.uncoveredCodeRegionsVirtualTextEditors_;
  }

  private async displayUncoveredCodeRegions(uri: vscode.Uri, uncoveredCodeInfo: Types.Modules.CoverageInfoCollector.CoverageInfo) {
    const uncoveredCodeRegionsVirtualTextEditor = await this.buildUncoveredCodeRegionsVirtualTextEditor(uri);
    const options: Array<vscode.DecorationOptions> = await this.buildDecorationOptions(uncoveredCodeInfo);

    uncoveredCodeRegionsVirtualTextEditor.setDecorations(this.decorationType, options);
  }

  private async displaySummaryCoverageInfo(uri: vscode.Uri, uncoveredCodeInfo: Types.Modules.CoverageInfoCollector.CoverageInfo) {
    const summary = await uncoveredCodeInfo.summary;

    this.outputChannel.appendLine(`Coverage summary for ${uri.fsPath}: ${summary.count} regions, ${summary.covered} are covered and ${summary.notCovered} are not covered. This file is ${summary.percent}% covered.`);
  }

  private async buildDecorationOptions(uncoveredCodeInfo: Types.Modules.CoverageInfoCollector.CoverageInfo) {
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

  private async queryUncoveredCodeInfo() {
    const uri = this.buildVirtualDocumentUri();

    const uncoveredCodeInfo = await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: Strings.progressComputingRegionsLocations,
      cancellable: false
    }, async progressReporter => {

      const coverageInfoProvider = CoverageInfoProvider.make({ progressReporter, outputChannel: this.outputChannel_ });

      try {
        return await coverageInfoProvider.getCoverageInfoForFile(uri.fsPath);
      } catch (error) {
        this.outputChannel_.appendLine((error as Error).message);
        throw error;
      }
    });

    return { uri, uncoveredCodeInfo };
  }

  private async buildUncoveredCodeRegionsVirtualTextEditor(uri: vscode.Uri) {
    const virtualDocument = await vscode.workspace.openTextDocument(uri);
    const virtualTextEditor = await vscode.window.showTextDocument(virtualDocument, { preserveFocus: false });
    const uncoveredCodeRegionsVirtualTextEditor = this.uncoveredCodeRegionsVirtualTextEditorFactory(virtualTextEditor);
    this.uncoveredCodeRegionsVirtualTextEditors_.set(uri.fsPath, uncoveredCodeRegionsVirtualTextEditor);

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
      path: (<Types.Modules.Extension.TextEditorLike>vscode.window.activeTextEditor).document.uri.path
    });
  }

  private onDidChangeActiveTextEditor(_textEditor?: Types.Modules.Extension.TextEditorLike) {
    const activeEditor = vscode.window.activeTextEditor;

    if (!activeEditor)
      return;

    const uri = activeEditor.document.uri;

    if (uri.scheme !== Definitions.extensionId)
      return;

    this.uncoveredCodeRegionsVirtualTextEditors.get(uri.fsPath)?.refreshDecorations();
  }

  private onDidChangeConfiguration(_e: vscode.ConfigurationChangeEvent) {
    this.outdateDecorationsForAllOpenedVirtualTextEditors();
  }

  private outdateDecorationsForAllOpenedVirtualTextEditors() {
    for (const editor of this.uncoveredCodeRegionsVirtualTextEditors.values())
      editor.outdateDecorationsWith(this.outdatedDecorationType);
  }

  private onDidSaveTextDocument(e: vscode.TextDocument) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(e.uri);

    if (!workspaceFolder)
      return;

    this.outdateDecorationsForAllOpenedVirtualTextEditors();
  }

  private readonly outputChannel_: Types.Adapters.Vscode.OutputChannelLikeWithLines;
  private readonly command: vscode.Disposable;
  private readonly textDocumentProvider: vscode.Disposable;
  private readonly uncoveredCodeRegionsVirtualTextEditors_: Map<string, Types.Modules.Extension.UncoveredCodeRegionsVirtualTextEditor>;
  private readonly decorationType: vscode.TextEditorDecorationType;
  private readonly outdatedDecorationType: vscode.TextEditorDecorationType;
  private readonly uncoveredCodeRegionsVirtualTextEditorFactory: UncoveredCodeRegionsVirtualTextEditorFactory;
  private readonly onDidChangeActiveTextEditorListenerDisposer: vscode.Disposable;
  private readonly onDidChangeConfigurationListenerDisposer: vscode.Disposable;
  private readonly onDidSaveTextDocumentListenerDisposer: vscode.Disposable;
}

type UncoveredCodeRegionsVirtualTextEditorFactory = (textEditor: Types.Modules.Extension.TextEditorLike) => Types.Modules.Extension.UncoveredCodeRegionsVirtualTextEditor;

type Context = {
  uncoveredCodeRegionsDocumentContentProvider: vscode.TextDocumentContentProvider,
  uncoveredCodeRegionsVirtualTextEditorFactory: UncoveredCodeRegionsVirtualTextEditorFactory,
  outputChannel: Types.Adapters.Vscode.OutputChannelLikeWithLines
}

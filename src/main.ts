import * as vscode from "vscode";

import * as CovertOps from "./modules/implementations/extension/covert-ops";
import * as UncoveredCodeRegionsDocumentContentProvider from "./adapters/implementations/vscode/uncovered-code-regions-document-content-provider";
import * as OutputChannel from "./adapters/implementations/vscode/output-channel";
import * as UncoveredCodeRegionsVirtualTextEditorFactory from "./factories/uncovered-code-regions-virtual-text-editor";
import * as Definitions from "./definitions";

export function activate(context: vscode.ExtensionContext): void {
  const covertOps = CovertOps.make({
    uncoveredCodeRegionsDocumentContentProvider: UncoveredCodeRegionsDocumentContentProvider.make(),
    uncoveredCodeRegionsVirtualTextEditorFactory: UncoveredCodeRegionsVirtualTextEditorFactory.make(),
    outputChannel: OutputChannel.make(vscode.window.createOutputChannel(Definitions.extensionId))
  });

  context.subscriptions.push(covertOps.asDisposable);
}

export function deactivate(): void { }

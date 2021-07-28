import * as vscode from "vscode";

import * as Cov from "./extension/implementations/cov";
import * as UncoveredCodeRegionsDocumentContentProvider from "./extension/implementations/uncovered-code-regions-document-content-provider";
import { TextEditorWithDecorations } from "./extension/implementations/text-editor-with-decorations"

export function activate(context: vscode.ExtensionContext): void {
  // TODO: make a factory
  const cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make(),
    textEditor => new TextEditorWithDecorations(textEditor));

  context.subscriptions.push(cov.asDisposable);
}

export function deactivate(): void { }

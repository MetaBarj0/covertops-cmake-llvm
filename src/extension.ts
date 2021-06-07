import { extensionId } from './definitions';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(`${extensionId}.displayMissingCoverage`, () => {
    vscode.window.showInformationMessage(`Hello from ${extensionId}!`);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {
}

import { extensionNameInSettings } from './definitions';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(`${extensionNameInSettings}.displayMissingCoverage`, () => {
    vscode.window.showInformationMessage(`Hello from ${extensionNameInSettings}!`);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {
}

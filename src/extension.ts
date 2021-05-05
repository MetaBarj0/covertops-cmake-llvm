import * as vscode from 'vscode';
import { extensionName } from './extension-name';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(`${extensionName}.displayMissingCoverage`, () => {
    vscode.window.showInformationMessage(`Hello from ${extensionName}!`);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {
}

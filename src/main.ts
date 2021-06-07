import * as definitions from './definitions';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(`${definitions.extensionNameInSettings}.reportUncoveredCodeRegionsInFile`, () => {
    vscode.window.showInformationMessage(`Hello from ${definitions.extensionNameInSettings}!`);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {
}

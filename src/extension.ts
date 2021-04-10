import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('cpp-llvm-coverage.displayMissingCoverage', () => {
    vscode.window.showInformationMessage('Hello from cpp-llvm-coverage!');
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {
}

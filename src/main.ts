import * as vscode from 'vscode';

import * as Cov from './extension/cov';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(Cov.make().asDisposable);
}

export function deactivate() { }

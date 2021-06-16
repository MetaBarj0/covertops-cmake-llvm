import * as vscode from 'vscode';

import * as CovFactory from './extension/factories/cov';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(CovFactory.make().asDisposable);
}

export function deactivate() {
}

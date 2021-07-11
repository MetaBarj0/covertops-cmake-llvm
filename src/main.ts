import * as vscode from 'vscode';

import * as Cov from './extension/cov';
import * as decorationLocationsProvider from './extension/factories/decoration-locations-provider';

export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(Cov.make(await decorationLocationsProvider.make()).asDisposable);
}

export function deactivate() { }

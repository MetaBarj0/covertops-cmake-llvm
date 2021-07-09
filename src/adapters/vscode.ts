import * as Abstractions from '../shared-kernel/abstractions/vscode';

import * as vscode from 'vscode';

export const workspace: Abstractions.VscodeWorkspaceLike = vscode.workspace;

export namespace window {
  export const createOutputChannel = vscode.window.createOutputChannel;
  export const withProgress = vscode.window.withProgress;
}

export namespace commands {
  export const registerCommand = vscode.commands.registerCommand;
}

export class Disposable extends vscode.Disposable { }

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ProgressLocation = vscode.ProgressLocation;

export type OutputChannel = vscode.OutputChannel;
export type TextEditor = vscode.TextEditor;
export type TextDocumentContentProvider = vscode.TextDocumentContentProvider;

export type DisposableLike = {
  dispose(): any;
};
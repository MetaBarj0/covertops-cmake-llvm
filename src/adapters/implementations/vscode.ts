import * as vscode from "vscode";

export const workspace = vscode.workspace;

export const window = {
  createOutputChannel: vscode.window.createOutputChannel,
  withProgress: vscode.window.withProgress
}

export const commands = {
  registerCommand: vscode.commands.registerCommand
}

export class Disposable extends vscode.Disposable { }

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ProgressLocation = vscode.ProgressLocation;

export type OutputChannel = vscode.OutputChannel;
export type TextEditor = vscode.TextEditor;
export type TextDocumentContentProvider = vscode.TextDocumentContentProvider;

export type DisposableLike = {
  dispose(): unknown;
};

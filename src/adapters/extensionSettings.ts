import { Settings } from '../records/settings';

import * as vscode from 'vscode';

export class ExtensionSettings implements Settings {
  constructor() {
    this.ensureWorkspaceExists();

    const vscodeSettings = vscode.workspace.getConfiguration('cmake-llvm-coverage');

    this.buildTreeDirectory = vscodeSettings.get('buildTreeDirectory') as string;
    this.cmakeCommand = vscodeSettings.get('cmakeCommand') as string;
    this.cmakeTarget = vscodeSettings.get('cmakeTarget') as string;
    this.coverageInfoFileName = vscodeSettings.get('coverageInfoFileName') as string;

    const workspaceFolders = vscode.workspace.workspaceFolders as Array<vscode.WorkspaceFolder>;
    this.rootDirectory = workspaceFolders[0].uri.fsPath;

    this.additionalCmakeOptions = vscodeSettings.get('additionalCmakeOptions') as Array<string>;
  }

  readonly buildTreeDirectory: string;
  readonly cmakeCommand: string;
  readonly cmakeTarget: string;
  readonly coverageInfoFileName: string;
  readonly rootDirectory: string;
  readonly additionalCmakeOptions: Array<string>;

  private ensureWorkspaceExists() {
    if (vscode.workspace.workspaceFolders === undefined) {
      throw new Error('A workspace must be loaded to get coverage information.');
    }
  }
};

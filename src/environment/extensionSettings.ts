import { Settings } from '../records/settings';

import * as vscode from 'vscode';
import * as path from 'path';

export class ExtensionSettings implements Settings {
  constructor() {
    this.ensureWorkspaceExistence();

    const vscodeSettings = vscode.workspace.getConfiguration('cmake-llvm-coverage');

    this.buildTreeDirectory = path.normalize(vscodeSettings.get('buildTreeDirectory') as string);
    this.cmakeCommand = vscodeSettings.get('cmakeCommand') as string;
    this.cmakeTarget = vscodeSettings.get('cmakeTarget') as string;
    this.coverageInfoFileNamePatterns = vscodeSettings.get('coverageInfoFileNamePatterns') as Array<string>;

    const workspaceFolders = vscode.workspace.workspaceFolders as Array<vscode.WorkspaceFolder>;
    this.rootDirectory = workspaceFolders[0].uri.fsPath;
  }

  buildTreeDirectory: string;
  cmakeCommand: string;
  cmakeTarget: string;
  coverageInfoFileNamePatterns: Array<string>;
  rootDirectory: string;

  private ensureWorkspaceExistence() {
    if (vscode.workspace.workspaceFolders === undefined) {
      throw new Error('A workspace must be loaded to get coverage information.');
    }
  }
};

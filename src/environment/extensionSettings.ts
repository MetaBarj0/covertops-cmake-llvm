import * as vscode from 'vscode';
import { Settings } from '../records/settings';

export class ExtensionSettings implements Settings {
  constructor() {
    this.checkWorkspace();

    const extensionConfiguration = vscode.workspace.getConfiguration('cpp-llvm-coverage');
  }

  cmakeCommand = '';
  buildTreeDirectory = '';
  cmakeTarget = '';
  coverageInfoFileNamePatterns = [];
  rootDirectory = '';

  private checkWorkspace() {
    if (vscode.workspace.workspaceFolders === undefined) {
      throw new Error('A workspace must be loaded to get coverage information.');
    }
  }
};

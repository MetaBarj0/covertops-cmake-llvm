import * as vscode from 'vscode';
import { Settings } from '../records/settings';

const extensionConfiguration = vscode.workspace.getConfiguration('cpp-llvm-coverage');

export class ExtensionSettings implements Settings {
    cmakeCommand = <string>extensionConfiguration.get('cmakeCommand');
    buildTreeDirectory = <string>extensionConfiguration.get('buildTreeDirectory');
    cmakeTarget = <string>extensionConfiguration.get('cmakeTarget');
    coverageInfoFileNamePatterns = <Array<string>>extensionConfiguration.get('coverageInfoFileNamePatterns');
    cwd = this.setupCwd(vscode.workspace.workspaceFolders);

    private setupCwd(workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined) {
        if (workspaceFolders === undefined)
            return '';

        return workspaceFolders[0].uri.fsPath.toString();
    }
};

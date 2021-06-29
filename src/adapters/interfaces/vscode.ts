import { SettingsContract } from "../../domain/interfaces/settings-contract";

// TODO: create a vscode workspace adapter
export type VscodeWorkspaceLike = {
    readonly workspaceFolders: ReadonlyArray<VscodeWorkspaceFolderLike> | undefined;
    readonly getConfiguration: (section?: string | undefined) => VscodeWorkspaceConfigurationLike;
};

export type VscodeWorkspaceFolderLike = {
    readonly uri: VscodeUriLike;
};

export type VscodeWorkspaceConfigurationLike = {
    get(section: keyof SettingsContract): SettingsContract[typeof section];
};

export type VscodeUriLike = {
    readonly fsPath: string;
};

export type OutputChannelLike = {
    appendLine(line: string): void;
};
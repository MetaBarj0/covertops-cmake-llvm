import { SettingsContract } from "../interfaces/settings-contract";

export class Settings implements SettingsContract {
  constructor(cmakeCommand: string,
    buildTreeDirectory: string,
    cmakeTarget: string,
    coverageInfoFileName: string,
    additionalCmakeOptions: ReadonlyArray<string>,
    rootDirectory: string) {
    this.cmakeCommand = cmakeCommand;
    this.buildTreeDirectory = buildTreeDirectory;
    this.cmakeTarget = cmakeTarget;
    this.coverageInfoFileName = coverageInfoFileName;
    this.additionalCmakeOptions = additionalCmakeOptions;
    this.rootDirectory = rootDirectory;
  }

  readonly cmakeCommand: string;
  readonly buildTreeDirectory: string;
  readonly cmakeTarget: string;
  readonly coverageInfoFileName: string;
  readonly additionalCmakeOptions: ReadonlyArray<string>;
  readonly rootDirectory: string;
};

export class Settings {
  constructor(cmakeCommand: string,
    buildTreeDirectory: string,
    cmakeTarget: string,
    coverageInfoFileName: string,
    rootDirectory: string,
    additionalCmakeOptions: ReadonlyArray<string>) {
    this.cmakeCommand = cmakeCommand;
    this.buildTreeDirectory = buildTreeDirectory;
    this.cmakeTarget = cmakeTarget;
    this.coverageInfoFileName = coverageInfoFileName;
    this.rootDirectory = rootDirectory;
    this.additionalCmakeOptions = additionalCmakeOptions;
  }

  readonly cmakeCommand: string;
  readonly buildTreeDirectory: string;
  readonly cmakeTarget: string;
  readonly coverageInfoFileName: string;
  readonly rootDirectory: string;
  readonly additionalCmakeOptions: ReadonlyArray<string>;
};
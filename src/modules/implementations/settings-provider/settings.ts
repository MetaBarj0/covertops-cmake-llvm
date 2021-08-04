import * as Abstractions from "../../abstractions/settings-provider/settings";

export function make(cmakeCommand: string,
  buildTreeDirectory: string,
  cmakeTarget: string,
  coverageInfoFileName: string,
  additionalCmakeOptions: ReadonlyArray<string>,
  rootDirectory: string): Abstractions.Settings {
  return new Settings(cmakeCommand, buildTreeDirectory, cmakeTarget, coverageInfoFileName, additionalCmakeOptions, rootDirectory);
}
class Settings implements Abstractions.Settings {
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
}

export type SettingsContract = {
  readonly cmakeCommand: string;
  readonly buildTreeDirectory: string;
  readonly cmakeTarget: string;
  readonly coverageInfoFileName: string;
  readonly additionalCmakeOptions: ReadonlyArray<string>;
  readonly rootDirectory: string;
};
export type Settings = {
  readonly cmakeCommand: string;
  readonly buildTreeDirectory: string;
  readonly cmakeTarget: string;
  readonly coverageInfoFileName: string,
  readonly rootDirectory: string,
  readonly additionalCmakeOptions: ReadonlyArray<string>
};
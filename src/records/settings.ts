export type Settings = {
  cmakeCommand: string;
  buildTreeDirectory: string;
  cmakeTarget: string;
  coverageInfoFileNamePatterns: Array<string>,
  rootDirectory: string,
  additionalCmakeOptions: Array<string>
};
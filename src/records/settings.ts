export type Settings = {
  cmakeCommand: string;
  buildTreeDirectory: string;
  cmakeTarget: string;
  coverageInfoFileName: string,
  rootDirectory: string,
  additionalCmakeOptions: Array<string>
};
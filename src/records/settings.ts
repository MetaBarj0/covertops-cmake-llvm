export type Settings = {
  cmakeCommand: string;
  buildTreeDirectory: string;
  cmakeTarget: string;
  coverageInfoFileNamePatterns: string[],
  rootDirectory: string
};
import { CoverageInfo } from "./coverage-info";

export type CoverageInfoProvider = {
  getCoverageInfoForFile(sourceFilePath: string): Thenable<CoverageInfo>;
};

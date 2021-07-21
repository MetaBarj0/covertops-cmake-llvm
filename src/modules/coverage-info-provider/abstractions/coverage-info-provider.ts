import { CoverageInfo } from "../../coverage-info-collector/abstractions/coverage-info";

export type CoverageInfoProvider = {
  getCoverageInfoForFile(sourceFilePath: string): Thenable<CoverageInfo>;
};
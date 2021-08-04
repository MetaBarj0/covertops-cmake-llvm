import { CoverageInfo } from "../coverage-info-collector/coverage-info";

export type CoverageInfoProvider = {
  getCoverageInfoForFile(sourceFilePath: string): Thenable<CoverageInfo>;
};

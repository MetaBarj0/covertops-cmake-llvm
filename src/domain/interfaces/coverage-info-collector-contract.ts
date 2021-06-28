import { CoverageInfo } from "../value-objects/coverage-info";

export type CoverageInfoCollectorContract = {
  collectFor(sourceFilePath: string): Promise<CoverageInfo>;
};
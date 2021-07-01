import { CoverageInfo } from './coverage-info';

export type CoverageInfoCollector = {
  collectFor(sourceFilePath: string): Promise<CoverageInfo>;
};
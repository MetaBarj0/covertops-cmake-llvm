import * as Abstractions from './coverage-info';

export type CoverageInfoCollector = {
  collectFor(sourceFilePath: string): Promise<Abstractions.CoverageInfo>;
};
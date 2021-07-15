import { CoverageSummary } from './coverage-summary';
import { RegionCoverageInfo } from './region-coverage-info';

export type CoverageInfo = {
  get summary(): Promise<CoverageSummary>;
  get uncoveredRegions(): AsyncGenerator<RegionCoverageInfo, void, unknown>;
};
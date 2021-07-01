import { CoverageSummary } from '../../domain/abstractions/coverage-summary';
import { RegionCoverageInfo } from '../../domain/abstractions/region-coverage-info';

export type CoverageInfo = {
  get summary(): Promise<CoverageSummary>;
  get uncoveredRegions(): AsyncGenerator<RegionCoverageInfo, void, unknown>;
};
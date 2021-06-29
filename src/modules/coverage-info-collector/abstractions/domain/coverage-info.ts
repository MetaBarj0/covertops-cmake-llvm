import { CoverageSummary } from '../../abstractions/domain/coverage-summary';
import { RegionCoverageInfo } from '../../abstractions/domain/region-coverage-info';

export type CoverageInfo = {
  get summary(): Promise<CoverageSummary>;
  get uncoveredRegions(): AsyncGenerator<RegionCoverageInfo, void, unknown>;
};
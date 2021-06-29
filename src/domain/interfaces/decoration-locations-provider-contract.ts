import { CoverageInfo } from "../../modules/coverage-info-collector/abstractions/domain/coverage-info";

export type DecorationLocationsProviderContract = {
  getDecorationLocationsForUncoveredCodeRegions(sourceFilePath: string): Thenable<CoverageInfo>;
};
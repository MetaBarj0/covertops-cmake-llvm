import { CoverageInfo } from "../../coverage-info-collector/abstractions/coverage-info";

export type DecorationLocationsProvider = {
  getDecorationLocationsForUncoveredCodeRegions(sourceFilePath: string): Thenable<CoverageInfo>;
};
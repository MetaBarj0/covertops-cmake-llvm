import { CoverageInfo } from "../../../coverage-info-collector/abstractions/domain/coverage-info";

export type DecorationLocationsProvider = {
  getDecorationLocationsForUncoveredCodeRegions(sourceFilePath: string): Thenable<CoverageInfo>;
};
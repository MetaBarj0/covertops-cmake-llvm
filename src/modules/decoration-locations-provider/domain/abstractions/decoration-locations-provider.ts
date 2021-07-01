import { CoverageInfo } from "../../../coverage-info-collector/domain/abstractions/coverage-info";

export type DecorationLocationsProvider = {
  getDecorationLocationsForUncoveredCodeRegions(sourceFilePath: string): Thenable<CoverageInfo>;
};
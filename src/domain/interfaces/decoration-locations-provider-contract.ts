import { CoverageInfo } from "../value-objects/coverage-info";

export type DecorationLocationsProviderContract = {
  getDecorationLocationsForUncoveredCodeRegions(sourceFilePath: string): Thenable<CoverageInfo>;
};
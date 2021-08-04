import * as RegionCoverageInfoModule from "../../../src/modules/abstractions/coverage-info-collector/region-coverage-info";
import * as AbstractSettingsProvider from "../../../src/modules/abstractions/settings-provider/settings";
import * as AbstractBuildTreeDirectoryResolver from "../../../src/modules/abstractions/build-tree-directory-resolver/build-tree-directory-resolver";
import * as AbstractCmake from "../../../src/modules/abstractions/cmake/cmake";
import * as AbstractCoverageInfoCollector from "../../../src/modules/abstractions/coverage-info-collector/coverage-info-collector";

export namespace Modules {
  export type RegionCoverageInfo = RegionCoverageInfoModule.RegionCoverageInfo;
  export type Settings = AbstractSettingsProvider.Settings;
  export type BuildTreeDirectoryResolver = AbstractBuildTreeDirectoryResolver.BuildTreeDirectoryResolver;
  export type Cmake = AbstractCmake.Cmake;
  export type CoverageInfoCollector = AbstractCoverageInfoCollector.CoverageInfoCollector;
}

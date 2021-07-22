import * as RegionCoverageInfoModule from "../../../src/modules/abstractions/region-coverage-info";
import * as AbstractSettingsProvider from "../../../src/modules/abstractions/settings";
import * as AbstractBuildTreeDirectoryResolver from "../../../src/modules/abstractions/build-tree-directory-resolver";
import * as AbstractCmake from "../../../src/modules/abstractions/cmake";
import * as AbstractCoverageInfoCollector from "../../../src/modules/abstractions/coverage-info-collector";

export namespace Modules {
  export type RegionCoverageInfo = RegionCoverageInfoModule.RegionCoverageInfo;
  export type Settings = AbstractSettingsProvider.Settings;
  export type BuildTreeDirectoryResolver = AbstractBuildTreeDirectoryResolver.BuildTreeDirectoryResolver;
  export type Cmake = AbstractCmake.Cmake;
  export type CoverageInfoCollector = AbstractCoverageInfoCollector.CoverageInfoCollector;
}
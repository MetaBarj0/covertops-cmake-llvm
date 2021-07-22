import * as RegionCoverageInfoModule from "../../../src/modules/coverage-info-collector/abstractions/region-coverage-info";
import * as AbstractSettingsProvider from "../../../src/modules/settings-provider/abstractions/settings";
import * as AbstractBuildTreeDirectoryResolver from "../../../src/modules/build-tree-directory-resolver/abstractions/build-tree-directory-resolver";
import * as AbstractCmake from "../../../src/modules/cmake/abstractions/cmake";
import * as AbstractCoverageInfoCollector from "../../../src/modules/coverage-info-collector/abstractions/coverage-info-collector";

export namespace Domain {
  export namespace Abstractions {
    export type RegionCoverageInfo = RegionCoverageInfoModule.RegionCoverageInfo;
    export type Settings = AbstractSettingsProvider.Settings;
    export type BuildTreeDirectoryResolver = AbstractBuildTreeDirectoryResolver.BuildTreeDirectoryResolver;
    export type Cmake = AbstractCmake.Cmake;
    export type CoverageInfoCollector = AbstractCoverageInfoCollector.CoverageInfoCollector;
  }
}

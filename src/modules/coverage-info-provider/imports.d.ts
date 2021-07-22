import { Settings as SettingsType } from "../settings-provider/abstractions/settings";
import { CoverageInfoProvider as AbstractCoverageInfoProvider } from "./abstractions/coverage-info-provider";
import { BuildTreeDirectoryResolver as BuildTreeDirectoryResolverType } from "../build-tree-directory-resolver/abstractions/build-tree-directory-resolver";
import { Cmake as CmakeType } from "../cmake/abstractions/cmake";
import { CoverageInfoCollector as CoverageInfoCollectorType } from "../coverage-info-collector/abstractions/coverage-info-collector";

export namespace Domain {
  export namespace Abstractions {
    export type Settings = SettingsType;
    export type CoverageInfoProvider = AbstractCoverageInfoProvider;
    export type BuildTreeDirectoryResolver = BuildTreeDirectoryResolverType;
    export type Cmake = CmakeType;
    export type CoverageInfoCollector = CoverageInfoCollectorType;
  }
}

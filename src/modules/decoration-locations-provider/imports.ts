import { Settings as SettingsType } from '../settings-provider/domain/abstractions/settings';
import { DecorationLocationsProvider as DecorationLocationsProviderType } from './domain/abstractions/decoration-locations-provider';
import { BuildTreeDirectoryResolver as BuildTreeDirectoryResolverType } from '../build-tree-directory-resolver/domain/abstractions/build-tree-directory-resolver';
import { Cmake as CmakeType } from '../cmake/domain/abstractions/cmake';
import { CoverageInfoCollector as CoverageInfoCollectorType } from '../coverage-info-collector/domain/abstractions/coverage-info-collector';

export namespace Domain {
  export namespace Abstractions {
    export type Settings = SettingsType;
    export type DecorationLocationsProvider = DecorationLocationsProviderType;
    export type BuildTreeDirectoryResolver = BuildTreeDirectoryResolverType;
    export type Cmake = CmakeType;
    export type CoverageInfoCollector = CoverageInfoCollectorType;
  }
}
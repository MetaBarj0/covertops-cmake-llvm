import { Settings as SettingsType } from '../settings-provider/abstractions/domain/settings';
import { DecorationLocationsProvider as DecorationLocationsProviderType } from './abstractions/domain/decoration-locations-provider';
import { BuildTreeDirectoryResolver as BuildTreeDirectoryResolverType } from '../build-tree-directory-resolver/abstractions/domain/build-tree-directory-resolver';

export namespace Abstractions {
  export namespace Domain {
    export type Settings = SettingsType;
    export type DecorationLocationsProvider = DecorationLocationsProviderType;
    export type BuildTreeDirectoryResolver = BuildTreeDirectoryResolverType;
  }
}
import { Settings as SettingsType } from '../settings-provider/abstractions/domain/settings';
import { DecorationLocationsProvider as DecorationLocationsProviderType } from './abstractions/domain/decoration-locations-provider';

export namespace Abstractions {
  export namespace Domain {
    export type Settings = SettingsType;
    export type DecorationLocationsProvider = DecorationLocationsProviderType;
  }
}
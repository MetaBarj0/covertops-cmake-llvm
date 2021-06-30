import * as _definitions from '../../extension/definitions';
import { Settings as SettingsContract } from './abstractions/domain/settings';
import * as SettingModule from './domain/settings';

export namespace Extension {
  export const definitions = _definitions;
}

export namespace Abstractions {
  export type Settings = SettingsContract;
}

export namespace Implementations {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export const Settings = SettingModule;
}
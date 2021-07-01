// TODO: Global, attempt to refacto all imports following this
import * as SettingModule from './domain/settings';
import * as DefinitionsModule from '../../extension/definitions';
import * as VscodeModule from '../../shared-kernel/abstractions/vscode';

import { Settings as SettingsType } from './abstractions/domain/settings';
import { SettingsProvider as SettingsProviderType } from './abstractions/domain/settings-provider';

export namespace Extension {
  export namespace Definitions {
    export const extensionId = DefinitionsModule.extensionId;
  }
}

export namespace Abstractions {
  export namespace Domain {
    export type Settings = SettingsType;
    export type SettingsProvider = SettingsProviderType;
  }

  export namespace Adapters {
    export namespace vscode {
      export type VscodeWorkspaceLike = VscodeModule.VscodeWorkspaceLike;
      export type OutputChannelLike = VscodeModule.OutputChannelLike;
      export type VscodeWorkspaceFolderLike = VscodeModule.VscodeWorkspaceFolderLike;
    }
  }
}

export namespace Implementations {
  export namespace Domain {
    export namespace Settings {
      export const make = SettingModule.make;
    }
  }
}
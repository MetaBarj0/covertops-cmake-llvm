import * as DefinitionsModule from "../../extension/definitions";
import * as VscodeModule from "../../adapters/abstractions/vscode";

import { Settings as SettingsType } from "./abstractions/settings";
import { SettingsProvider as SettingsProviderType } from "./abstractions/settings-provider";

import * as SettingModule from "./implementations/settings";

export namespace Extension {
  export namespace Definitions {
    export const extensionId = DefinitionsModule.extensionId;
  }
}

export namespace Domain {
  export namespace Abstractions {
    export type Settings = SettingsType;
    export type SettingsProvider = SettingsProviderType;
  }
  export namespace Implementations {
    export namespace Settings {
      export const make = SettingModule.make;
    }
  }

}

export namespace Adapters {

  export namespace Abstractions {
    export namespace vscode {
      export type VscodeWorkspaceLike = VscodeModule.VscodeWorkspaceLike;
      export type OutputChannelLike = VscodeModule.OutputChannelLike;
      export type VscodeWorkspaceFolderLike = VscodeModule.VscodeWorkspaceFolderLike;
    }
  }
}

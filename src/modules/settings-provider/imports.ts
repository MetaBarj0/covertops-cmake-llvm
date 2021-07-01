import * as _definitions from '../../extension/definitions';
import { Settings as _Settings } from './abstractions/domain/settings';
import { SettingsProvider as _SettingsProvider } from './abstractions/domain/settings-provider';
import * as SettingModule from './domain/settings';
import * as _vscode from '../../shared-kernel/abstractions/vscode';

export namespace Extension {
  export const definitions = _definitions;
}

export namespace Abstractions {
  export namespace Domain {
    export type Settings = _Settings;
    export type SettingsProvider = _SettingsProvider;
  }

  export namespace Adapters {
    export namespace vscode {
      export type VscodeWorkspaceLike = _vscode.VscodeWorkspaceLike;
      export type OutputChannelLike = _vscode.OutputChannelLike;
      export type VscodeWorkspaceFolderLike = _vscode.VscodeWorkspaceFolderLike;
    }
  }
}

export namespace Implementations {
  export namespace Domain {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const Settings = SettingModule;
  }
}
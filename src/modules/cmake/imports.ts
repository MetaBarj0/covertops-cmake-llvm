import * as VscodeModule from '../../shared-kernel/abstractions/vscode';
import * as CmakeModule from '../cmake/domain/abstractions/cmake';
import * as BasicCmakeModule from '../cmake/domain/implementations/basic-cmake';
import * as SettingsProviderModule from '../settings-provider/domain/abstractions/settings';
import * as ProcessControlModule from '../../shared-kernel/abstractions/process-control';
import * as DefinitionsModule from '../../extension/definitions';

export namespace Adapters {
  export namespace Abstractions {
    export namespace vscode {
      export type ProgressLike = VscodeModule.ProgressLike;
      export type OutputChannelLike = VscodeModule.OutputChannelLike;
    }

    export namespace processControl {
      export type ExecFileCallable = ProcessControlModule.ExecFileCallable;
    }
  }
}

export namespace Domain {
  export namespace Abstractions {
    export type Cmake = CmakeModule.Cmake;
    export type Settings = SettingsProviderModule.Settings;
  }

  export namespace Implementations {
    export abstract class BasicCmake extends BasicCmakeModule.BasicCmake { }
  }
}

export namespace Extension {
  export namespace Definitions {
    export const extensionNameInSettings = DefinitionsModule.extensionNameInSettings;
  }
}
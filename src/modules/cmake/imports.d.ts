import * as VscodeModule from "../../adapters/abstractions/vscode";
import { Cmake as AbstractCmake } from "./abstractions/cmake";
import * as SettingsProviderModule from "../settings-provider/abstractions/settings";
import * as AbstractProcessControl from "../../adapters/abstractions/process-control";

export namespace Adapters {
  export namespace Abstractions {
    export namespace vscode {
      export type ProgressLike = VscodeModule.ProgressLike;
      export type OutputChannelLike = VscodeModule.OutputChannelLike;
    }

    export namespace processControl {
      export type ExecFileCallable = AbstractProcessControl.ExecFileCallable;
    }
  }
}

export namespace Domain {
  export namespace Abstractions {
    export type Cmake = AbstractCmake;
    export type Settings = SettingsProviderModule.Settings;
  }
}
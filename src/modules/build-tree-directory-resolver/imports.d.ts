import * as BuildTreeDirectoryResolverModule from "./abstractions/build-tree-directory-resolver";
import * as SettingsModule from "../settings-provider/abstractions/settings";
import * as FileSytemModule from "../../adapters/abstractions/file-system";
import * as VscodeModule from "../../adapters/abstractions/vscode";

export namespace Domain {
  export namespace Abstractions {
    export type BuildTreeDirectoryResolver = BuildTreeDirectoryResolverModule.BuildTreeDirectoryResolver;
    export type Settings = SettingsModule.Settings;
  }
}

export namespace Adapters {
  export namespace Abstractions {
    export namespace fileSystem {
      export type StatCallable = FileSytemModule.StatCallable;
      export type MkdirCallable = FileSytemModule.MkdirCallable;
    }

    export namespace vscode {
      export type ProgressLike = VscodeModule.ProgressLike;
      export type OutputChannelLike = VscodeModule.OutputChannelLike;
    }
  }
}

import * as CoverageInfoFileResolverModule from "./abstractions/coverage-info-file-resolver";
import * as SettingsModule from "../settings-provider/abstractions/settings";
import * as FileSystemModule from "../../adapters/abstractions/file-system";
import * as VscodeModule from "../../adapters/abstractions/vscode";
import * as DefinitionsModule from "../../extension/definitions";

export namespace Domain {
  export namespace Abstractions {
    export type CoverageInfoFileResolver = CoverageInfoFileResolverModule.CoverageInfoFileResolver;
    export type Settings = SettingsModule.Settings;
  }
}

export namespace Adapters {
  export namespace Abstractions {
    export namespace fileSystem {
      export type GlobSearchCallable = FileSystemModule.GlobSearchCallable;
    }

    export namespace vscode {
      export type ProgressLike = VscodeModule.ProgressLike;
      export type OutputChannelLike = VscodeModule.OutputChannelLike;
    }
  }
}

export namespace Extension {
  export namespace Definitions {
    export const extensionNameInSettings = DefinitionsModule.extensionNameInSettings;
  }
}

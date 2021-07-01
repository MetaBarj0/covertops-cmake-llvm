import * as CoverageInfoFileResolverModule from './domain/abstractions/coverage-info-file-resolver';
import * as SettingsModule from '../settings-provider/domain/abstractions/settings';
import * as FileSystemModule from '../../shared-kernel/abstractions/file-system';
import * as VscodeModule from '../../shared-kernel/abstractions/vscode';
import * as DefinitionsModule from '../../extension/definitions';

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
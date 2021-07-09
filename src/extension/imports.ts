import * as DefinitionsModule from './definitions';

import * as VscodeModule from '../adapters/vscode';
import * as SettingsProviderModule from '../modules/settings-provider/domain/implementations/settings-provider';
import * as BuildTreeDirectoryResolverModule from '../modules/build-tree-directory-resolver/domain/implementations/build-tree-directory-resolver';
import * as fileSystemModule from '../adapters/file-system';
import * as CmakeModule from '../modules/cmake/domain/implementations/cmake';
import * as processControlModule from '../adapters/process-control';
import * as CoverageInfoCollectorModule from '../modules/coverage-info-collector/domain/implementations/coverage-info-collector';
import * as DecorationLocationProviderModule from '../modules/decoration-locations-provider/domain/implementations/decoration-locations-provider';
import * as CoverageInfoFileResolverModule from '../modules/coverage-info-file-resolver/domain/implementations/coverage-info-file-resolver';

export namespace Extension {
  export namespace Definitions {
    export const extensionId = DefinitionsModule.extensionId;
    export const extensionDisplayName = DefinitionsModule.extensionDisplayName;
  }
}

export namespace Adapters {
  export namespace Implementations {

    export namespace vscode {
      export namespace window {
        export const createOutputChannel = VscodeModule.window.createOutputChannel;
        export const withProgress = VscodeModule.window.withProgress;
      }
      export namespace commands {
        export const registerCommand = VscodeModule.commands.registerCommand;
      }

      export class Disposable extends VscodeModule.Disposable { };

      // eslint-disable-next-line @typescript-eslint/naming-convention
      export const ProgressLocation = VscodeModule.ProgressLocation;

      export const workspace = VscodeModule.workspace;
    }

    export namespace fileSystem {
      export const stat = fileSystemModule.stat;
      export const mkdir = fileSystemModule.mkdir;
      export const globSearch = fileSystemModule.globSearch;
      export const createReadStream = fileSystemModule.createReadStream;
    }

    export namespace processControl {
      export const execFile = processControlModule.execFile;
    }
  }

  export namespace Abstractions {
    export namespace vscode {
      export type OutputChannel = VscodeModule.OutputChannel;
      export type TextEditor = VscodeModule.TextEditor;
    }
  }
}

export namespace Domain {
  export namespace Implementations {
    export namespace SettingsProvider {
      export const make = SettingsProviderModule.make;
    }

    export namespace BuildTreeDirectoryResolver {
      export const make = BuildTreeDirectoryResolverModule.make;
    }

    export namespace Cmake {
      export const make = CmakeModule.make;
    }

    export namespace CoverageInfoCollector {
      export const make = CoverageInfoCollectorModule.make;
    }

    export namespace DecorationLocationProvider {
      export const make = DecorationLocationProviderModule.make;
    }

    export namespace CoverageInfoFileResolver {
      export const make = CoverageInfoFileResolverModule.make;
    }
  }
}
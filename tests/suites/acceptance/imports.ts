// TODO: group adapters fake
import * as VscodeFakes from '../../fakes/adapters/vscode';
import * as ErrorChannelFakes from '../../fakes/adapters/error-channel';
import * as ProgressReporterFakes from '../../fakes/adapters/progress-reporter';

// TODO: group adapters fake
import * as MkdirFakes from '../../fakes/adapters/mk-dir';
import * as StatFileFakes from '../../fakes/adapters/stat-file';
import * as GlobSearchFakes from '../../fakes/adapters/globbing';
import * as InputStreamFakes from '../../fakes/adapters/input-stream';

import * as ProcessControlFakes from '../../fakes/adapters/process-control';
import * as SettingsProviderModule from '../../../src/modules/settings-provider/domain/implementations/settings-provider';
import * as BuildTreeDirectoryResolverModule from '../../../src/modules/build-tree-directory-resolver/domain/implementations/build-tree-directory-resolver';
import * as CmakeModule from '../../../src/modules/cmake/domain/implementations/cmake';
import * as CoverageInfoCollectorModule from '../../../src/modules/coverage-info-collector/domain/implementations/coverage-info-collector';
import * as DecorationLocationsProviderModule from '../../../src/modules/decoration-locations-provider/domain/implementations/decoration-locations-provider';
import * as ExtensionModule from '../../../src/extension/definitions';
import * as RegionCoverageInfoModule from '../../../src/modules/coverage-info-collector/domain/abstractions/region-coverage-info';

export namespace Fakes {
  export namespace Adapters {
    export namespace vscode {
      export const buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings = VscodeFakes.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings;
      export const buildFakeErrorChannel = ErrorChannelFakes.buildFakeErrorChannel;
      export const buildFakeProgressReporter = ProgressReporterFakes.buildFakeProgressReporter;
      export const buildSpyOfProgressReporter = ProgressReporterFakes.buildSpyOfProgressReporter;
    }

    export namespace FileSystem {
      export const buildFakeFailingMkDir = MkdirFakes.buildFakeFailingMkDir;
      export const buildFakeFailingStatFile = StatFileFakes.buildFakeFailingStatFile;
      export const buildFakeGlobSearchForNoMatch = GlobSearchFakes.buildFakeGlobSearchForNoMatch;
      export const buildFakeStreamBuilder = InputStreamFakes.buildFakeStreamBuilder;
      export const buildEmptyReadableStream = InputStreamFakes.buildEmptyReadableStream;
      export const buildFakeSucceedingStatFile = StatFileFakes.buildFakeSucceedingStatFile;
      export const buildFakeGlobSearchForSeveralMatch = GlobSearchFakes.buildFakeGlobSearchForSeveralMatch;
      export const buildFakeSucceedingMkDir = MkdirFakes.buildFakeSucceedingMkDir;
      export const buildFakeGlobSearchForExactlyOneMatch = GlobSearchFakes.buildFakeGlobSearchForExactlyOneMatch;
      export const buildValidLlvmCoverageJsonObjectStream = InputStreamFakes.buildValidLlvmCoverageJsonObjectStream;
    }

    export namespace ProcessControl {
      export const buildFakeFailingProcess = ProcessControlFakes.buildFakeFailingProcess;
      export const buildFakeSucceedingProcess = ProcessControlFakes.buildFakeSucceedingProcess;
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

    export namespace DecorationLocationsProvider {
      export const make = DecorationLocationsProviderModule.make;
    }
  }

  export namespace Abstractions {
    export type RegionCoverageInfo = RegionCoverageInfoModule.RegionCoverageInfo;
  }
}

export namespace Extension {
  export namespace Definitions {
    export const extensionNameInSettings = ExtensionModule.extensionNameInSettings;
    export const extensionId = ExtensionModule.extensionId;
  }
}
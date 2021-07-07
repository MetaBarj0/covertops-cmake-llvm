import * as VscodeFakes from '../../fakes/adapters/vscode';
import * as ErrorChannelFakes from '../../fakes/adapters/error-channel';
import * as ProgressReporterFakes from '../../fakes/adapters/progress-reporter';
import * as GlobSearchFakes from '../../fakes/adapters/globbing';
import * as InputStreamFakes from '../../fakes/adapters/input-stream';
import * as ProcessControlFakes from '../../fakes/adapters/process-control';
import * as StatFileFakes from '../../fakes/adapters/stat-file';
import * as MkdirFakes from '../../fakes/adapters/mk-dir';
import * as CmakeFakes from '../../fakes/domain/cmake';
import * as SettingsProviderModule from '../../../src/modules/settings-provider/domain/implementations/settings-provider';
import * as CoverageInfoFileResolverModule from '../../../src/modules/coverage-info-file-resolver/domain/implementations/coverage-info-file-resolver';
import * as RegionCoverageInfoModule from '../../../src/modules/coverage-info-collector/domain/abstractions/region-coverage-info';
import * as CoverageInfoCollectorModule from '../../../src/modules/coverage-info-collector/domain/implementations/coverage-info-collector';
import * as BuildTreeDirectoryResolverModule from '../../../src/modules/build-tree-directory-resolver/domain/implementations/build-tree-directory-resolver';
import * as CmakeModule from '../../../src/modules/cmake/domain/implementations/cmake';
import * as TestUtilsModule from '../../utils/settings';
import * as DefinitionsModule from '../../../src/extension/definitions';

export namespace Fakes {
  export namespace Adapters {
    export namespace vscode {
      export const buildFakeWorkspaceWithoutWorkspaceFolderAndWithoutSettings = VscodeFakes.buildFakeWorkspaceWithoutWorkspaceFolderAndWithoutSettings;
      export const buildSpyOfErrorChannel = ErrorChannelFakes.buildSpyOfErrorChannel;
      export const buildFakeErrorChannel = ErrorChannelFakes.buildFakeErrorChannel;
      export const buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings = VscodeFakes.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings;
      export const buildFakeProgressReporter = ProgressReporterFakes.buildFakeProgressReporter;
      export const buildSpyOfProgressReporter = ProgressReporterFakes.buildSpyOfProgressReporter;
    }

    export namespace FileSystem {
      export const buildFakeGlobSearchForNoMatch = GlobSearchFakes.buildFakeGlobSearchForNoMatch;
      export const buildFakeGlobSearchForExactlyOneMatch = GlobSearchFakes.buildFakeGlobSearchForExactlyOneMatch;
      export const buildEmptyReadableStream = InputStreamFakes.buildEmptyReadableStream;
      export const buildInvalidLlvmCoverageJsonObjectStream = InputStreamFakes.buildInvalidLlvmCoverageJsonObjectStream;
      export const buildNotJsonStream = InputStreamFakes.buildNotJsonStream;
      export const buildFakeStreamBuilder = InputStreamFakes.buildFakeStreamBuilder;
      export const buildValidLlvmCoverageJsonObjectStream = InputStreamFakes.buildValidLlvmCoverageJsonObjectStream;
      export const buildFakeFailingStatFile = StatFileFakes.buildFakeFailingStatFile;
      export const buildFakeFailingMkDir = MkdirFakes.buildFakeFailingMkDir;
      export const buildFakeSucceedingStatFile = StatFileFakes.buildFakeSucceedingStatFile;
      export const buildFakeSucceedingMkDir = MkdirFakes.buildFakeSucceedingMkDir;
    }

    export namespace ProcessControl {
      export const buildFakeFailingProcess = ProcessControlFakes.buildFakeFailingProcess;
      export const buildFakeSucceedingProcess = ProcessControlFakes.buildFakeSucceedingProcess;
    }
  }

  export namespace Domain {
    export const buildUnreachableCmake = CmakeFakes.buildUnreachableCmake;
    export const buildCmakeFailingAtGeneratingProject = CmakeFakes.buildCmakeFailingAtGeneratingProject;
    export const buildCmakeFailingAtBuildingTarget = CmakeFakes.buildCmakeFailingAtBuildingTarget;
    export const buildFakeSucceedingCmake = CmakeFakes.buildFakeSucceedingCmake;
  }
}

export namespace Domain {
  export namespace Implementations {
    export namespace SettingsProvider {
      export const make = SettingsProviderModule.make;
    }

    export namespace CoverageInfoFileResolver {
      export const make = CoverageInfoFileResolverModule.make;
    }

    export namespace CoverageInfoCollector {
      export const make = CoverageInfoCollectorModule.make;
    }

    export namespace Cmake {
      export const make = CmakeModule.make;
    }

    export namespace BuildTreeDirectoryResolver {
      export const make = BuildTreeDirectoryResolverModule.make;
    }
  }

  export namespace Abstractions {
    export type RegionCoverageInfo = RegionCoverageInfoModule.RegionCoverageInfo;
  }
}

export namespace TestUtils {
  export const defaultSetting = TestUtilsModule.defaultSetting;
}

export namespace Extension {
  export namespace Definitions {
    export const extensionNameInSettings = DefinitionsModule.extensionNameInSettings;
  }
}
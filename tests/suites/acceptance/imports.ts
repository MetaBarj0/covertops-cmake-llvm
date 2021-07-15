import * as FileSystemFakes from '../../fakes/adapters/file-system';

import * as VscodeFakes from '../../fakes/adapters/vscode';
import * as ProcessControlFakes from '../../fakes/adapters/process-control';
import * as SettingsProviderModule from '../../../src/modules/settings-provider/implementations/settings-provider';
import * as BuildTreeDirectoryResolverModule from '../../../src/modules/build-tree-directory-resolver/implementations/build-tree-directory-resolver';
import * as CmakeModule from '../../../src/modules/cmake/implementations/cmake';
import * as CoverageInfoCollectorModule from '../../../src/modules/coverage-info-collector/implementations/coverage-info-collector';
import * as DecorationLocationsProviderModule from '../../../src/modules/decoration-locations-provider/implementations/decoration-locations-provider';
import * as CoverageInfoFileResolverModule from '../../../src/modules/coverage-info-file-resolver/implementations/coverage-info-file-resolver';
import * as ExtensionModule from '../../../src/extension/definitions';
import * as RegionCoverageInfoModule from '../../../src/modules/coverage-info-collector/abstractions/region-coverage-info';
import * as AbstractSettingsProvider from '../../../src/modules/settings-provider/abstractions/settings';
import * as AbstractBuildTreeDirectoryResolver from '../../../src/modules/build-tree-directory-resolver/abstractions/build-tree-directory-resolver';
import * as AbstractCmake from '../../../src/modules/cmake/abstractions/cmake';
import * as AbstractCoverageInfoCollector from '../../../src/modules/coverage-info-collector/abstractions/coverage-info-collector';

export namespace Fakes {
  export namespace Adapters {
    export namespace vscode {
      export const buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings = VscodeFakes.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings;
      export const buildFakeErrorChannel = VscodeFakes.buildFakeErrorChannel;
      export const buildFakeProgressReporter = VscodeFakes.buildFakeProgressReporter;
      export const buildSpyOfProgressReporter = VscodeFakes.buildSpyOfProgressReporter;
    }

    export namespace FileSystem {
      export const buildFakeFailingMkDir = FileSystemFakes.buildFakeFailingMkDir;
      export const buildFakeFailingStatFile = FileSystemFakes.buildFakeFailingStatFile;
      export const buildFakeGlobSearchForNoMatch = FileSystemFakes.buildFakeGlobSearchForNoMatch;
      export const buildFakeStreamBuilder = FileSystemFakes.buildFakeStreamBuilder;
      export const buildEmptyReadableStream = FileSystemFakes.buildEmptyReadableStream;
      export const buildFakeSucceedingStatFile = FileSystemFakes.buildFakeSucceedingStatFile;
      export const buildFakeGlobSearchForSeveralMatch = FileSystemFakes.buildFakeGlobSearchForSeveralMatch;
      export const buildFakeSucceedingMkDir = FileSystemFakes.buildFakeSucceedingMkDir;
      export const buildFakeGlobSearchForExactlyOneMatch = FileSystemFakes.buildFakeGlobSearchForExactlyOneMatch;
      export const buildValidLlvmCoverageJsonObjectStream = FileSystemFakes.buildValidLlvmCoverageJsonObjectStream;
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

    export namespace CoverageInfoFileResolver {
      export const make = CoverageInfoFileResolverModule.make;
    }
  }

  export namespace Abstractions {
    export type RegionCoverageInfo = RegionCoverageInfoModule.RegionCoverageInfo;
    export type Settings = AbstractSettingsProvider.Settings;
    export type BuildTreeDirectoryResolver = AbstractBuildTreeDirectoryResolver.BuildTreeDirectoryResolver;
    export type Cmake = AbstractCmake.Cmake;
    export type CoverageInfoCollector = AbstractCoverageInfoCollector.CoverageInfoCollector;
  }
}

export namespace Extension {
  export namespace Definitions {
    export const extensionNameInSettings = ExtensionModule.extensionNameInSettings;
    export const extensionId = ExtensionModule.extensionId;
  }
}
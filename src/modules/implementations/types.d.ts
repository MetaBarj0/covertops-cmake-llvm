import * as BuildTreeDirectoryResolverModule from "../abstractions/build-tree-directory-resolver";
import * as SettingsModule from "../abstractions/settings";
import * as FileSytemModule from "../../adapters/abstractions/file-system";
import * as VscodeModule from "../../adapters/abstractions/vscode";
import * as CmakeModule from "../abstractions/cmake";
import * as AbstractProcessControl from "../../adapters/abstractions/process-control";
import * as CoverageInfoFileResolverModule from "../abstractions/coverage-info-file-resolver";
import * as FileSystemModule from "../../adapters/abstractions/file-system";
import * as CoverageInfoProviderModule from "../abstractions/coverage-info-provider";
import * as CoverageInfoCollectorModule from "../abstractions/coverage-info-collector";
import * as AbstractRegionCoverageInfoModule from "../abstractions/region-coverage-info";
import * as AbstractCoverageSummaryModule from "../abstractions/coverage-summary";
import * as AbstractCoverageInfoModule from "../abstractions/coverage-info";
import * as SettingsProviderModule from "../abstractions/settings-provider";

export namespace Modules {
  export namespace Abstractions {
    export type BuildTreeDirectoryResolver = BuildTreeDirectoryResolverModule.BuildTreeDirectoryResolver;
    export type Cmake = CmakeModule.Cmake;
    export type CoverageInfoCollector = CoverageInfoCollectorModule.CoverageInfoCollector;
    export type CoverageInfoFileResolver = CoverageInfoFileResolverModule.CoverageInfoFileResolver;
    export type CoverageInfoProvider = CoverageInfoProviderModule.CoverageInfoProvider;
    export type Settings = SettingsModule.Settings;
    export type SettingsProvider = SettingsProviderModule.SettingsProvider;
    export type RegionCoverageInfo = AbstractRegionCoverageInfoModule.RegionCoverageInfo;
    export type RegionRange = AbstractRegionCoverageInfoModule.RegionRange;
    export type CoverageInfo = AbstractCoverageInfoModule.CoverageInfo;
    export type CoverageSummary = AbstractCoverageSummaryModule.CoverageSummary;
    export type RawLLVMRegionCoverageInfo = AbstractRegionCoverageInfoModule.RawLLVMRegionCoverageInfo;
    export type RawLLVMFunctionCoverageInfo = AbstractRegionCoverageInfoModule.RawLLVMFunctionCoverageInfo;
    export type RawLLVMRegionsCoverageInfo = AbstractRegionCoverageInfoModule.RawLLVMRegionsCoverageInfo;
    export type RawLLVMFileCoverageInfo = AbstractRegionCoverageInfoModule.RawLLVMFileCoverageInfo;
    export type RawLLVMStreamedDataItemCoverageInfo = AbstractRegionCoverageInfoModule.RawLLVMStreamedDataItemCoverageInfo;
  }
}

export namespace Adapters {
  export namespace Abstractions {
    export namespace fileSystem {
      export type CreateReadStreamCallable = FileSystemModule.CreateReadStreamCallable;
      export type GlobSearchCallable = FileSystemModule.GlobSearchCallable;
      export type MkdirCallable = FileSytemModule.MkdirCallable;
      export type StatCallable = FileSytemModule.StatCallable;
    }

    export namespace vscode {
      export type ProgressLike = VscodeModule.ProgressLike;
      export type OutputChannelLike = VscodeModule.OutputChannelLike;
      export type VscodeWorkspaceLike = VscodeModule.VscodeWorkspaceLike;
      export type VscodeWorkspaceFolderLike = VscodeModule.VscodeWorkspaceFolderLike;
    }

    export namespace processControl {
      export type ExecFileCallable = AbstractProcessControl.ExecFileCallable;
    }
  }
}

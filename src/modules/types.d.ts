// TODO: this one is a good candidate for the unique types.d.ts
import * as BuildTreeDirectoryResolverModule from "./abstractions/build-tree-directory-resolver/build-tree-directory-resolver";
import * as SettingsModule from "./abstractions/settings-provider/settings";
import * as FileSytemModule from "../adapters/abstractions/node/file-system";
import * as WorkspaceModule from "../adapters/abstractions/vscode/workspace";
import * as CmakeModule from "./abstractions/cmake/cmake";
import * as AbstractProcessControl from "../adapters/abstractions/node/process-control";
import * as CoverageInfoFileResolverModule from "./abstractions/coverage-info-file-resolver/coverage-info-file-resolver";
import * as FileSystemModule from "../adapters/abstractions/node/file-system";
import * as CoverageInfoCollectorModule from "./abstractions/coverage-info-collector/coverage-info-collector";
import * as AbstractRegionCoverageInfoModule from "./abstractions/coverage-info-collector/region-coverage-info";
import * as AbstractCoverageSummaryModule from "./abstractions/coverage-info-collector/coverage-summary";
import * as AbstractCoverageInfoModule from "./abstractions/coverage-info-collector/coverage-info";
import * as SettingsProviderModule from "./abstractions/settings-provider/settings-provider";
import * as CoverageInfoProviderModule from "../modules/abstractions/coverage-info-provider/coverage-info-provider";
import * as OutputChannelModule from "../adapters/abstractions/vscode/output-channel";
import * as TextEditorModule from "../adapters/abstractions/vscode/text-editor";
import * as ProgressModule from "../adapters/abstractions/vscode/progress";
import * as CovertOpsModule from "../modules/abstractions/extension/covert-ops";

export namespace Extension {
  export type UncoveredCodeRegionsVirtualTextEditor = TextEditorModule.UncoveredCodeRegionsVirtualTextEditor;
  export type Decorations = TextEditorModule.Decorations;
  export type CovertOps = CovertOpsModule.CovertOps;
  export type TextEditorLike = TextEditorModule.TextEditorLike;
}

export namespace Modules {
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

export namespace Adapters {
  export namespace fileSystem {
    export type CreateReadStreamCallable = FileSystemModule.CreateReadStreamCallable;
    export type GlobSearchCallable = FileSystemModule.GlobSearchCallable;
    export type MkdirCallable = FileSytemModule.MkdirCallable;
    export type StatCallable = FileSytemModule.StatCallable;
  }

  export namespace vscode {
    export type ProgressLike = ProgressModule.ProgressLike;
    export type OutputChannelLike = OutputChannelModule.OutputChannelLike;
    export type VscodeWorkspaceLike = WorkspaceModule.VscodeWorkspaceLike;
    export type VscodeWorkspaceFolderLike = WorkspaceModule.VscodeWorkspaceFolderLike;
    export type OutputChannelLikeWithLines = OutputChannelModule.OutputChannelLikeWithLines;
    export type UncoveredCodeRegionsVirtualTextEditor = TextEditorModule.UncoveredCodeRegionsVirtualTextEditor;
  }

  export namespace processControl {
    export type ExecFileCallable = AbstractProcessControl.ExecFileCallable;
  }
}

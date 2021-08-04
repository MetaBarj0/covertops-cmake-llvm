import * as BuildTreeDirectoryResolverModule from "./modules/abstractions/build-tree-directory-resolver/build-tree-directory-resolver";
import * as CmakeModule from "./modules/abstractions/cmake/cmake";
import * as CoverageInfoCollectorModule from "./modules/abstractions/coverage-info-collector/coverage-info-collector";
import * as CoverageInfoFileResolverModule from "./modules/abstractions/coverage-info-file-resolver/coverage-info-file-resolver";
import * as CoverageInfoModule from "./modules/abstractions/coverage-info-collector/coverage-info";
import * as CoverageInfoProviderModule from "./modules/abstractions/coverage-info-provider/coverage-info-provider";
import * as CoverageSummaryModule from "./modules/abstractions/coverage-info-collector/coverage-summary";
import * as CovertOpsModule from "./modules/abstractions/extension/covert-ops";
import * as DisposableModule from "./adapters/abstractions/vscode/disposable";
import * as FileSystemModule from "./adapters/abstractions/node/file-system";
import * as OutputChannelModule from "./adapters/abstractions/vscode/output-channel";
import * as ProcessControlModule from "./adapters/abstractions/node/process-control";
import * as ProgressModule from "./adapters/abstractions/vscode/progress";
import * as RegionCoverageInfoModule from "./modules/abstractions/coverage-info-collector/region-coverage-info";
import * as SettingsModule from "./modules/abstractions/settings-provider/settings";
import * as SettingsProviderModule from "./modules/abstractions/settings-provider/settings-provider";
import * as TextDocumentContentProviderModule from "./adapters/abstractions/vscode/text-document-content-provider";
import * as TextEditorModule from "./adapters/abstractions/vscode/text-editor";
import * as WorkspaceModule from "./adapters/abstractions/vscode/workspace";

export namespace Modules {
  export namespace BuildTreeDirectoryResolver {
    export type BuildTreeDirectoryResolver = BuildTreeDirectoryResolverModule.BuildTreeDirectoryResolver;
  }

  export namespace Cmake {
    export type Cmake = CmakeModule.Cmake;
  }

  export namespace CoverageInfoCollector {
    export type CoverageInfo = CoverageInfoModule.CoverageInfo;
    export type CoverageInfoCollector = CoverageInfoCollectorModule.CoverageInfoCollector;
    export type CoverageSummary = CoverageSummaryModule.CoverageSummary;
    export type RegionCoverageInfo = RegionCoverageInfoModule.RegionCoverageInfo;
    export type RegionRange = RegionCoverageInfoModule.RegionRange;
    export type RawLLVMFileCoverageInfo = RegionCoverageInfoModule.RawLLVMFileCoverageInfo;
    export type RawLLVMFunctionCoverageInfo = RegionCoverageInfoModule.RawLLVMFunctionCoverageInfo;
    export type RawLLVMRegionCoverageInfo = RegionCoverageInfoModule.RawLLVMRegionCoverageInfo;
    export type RawLLVMRegionsCoverageInfo = RegionCoverageInfoModule.RawLLVMRegionsCoverageInfo;
    export type RawLLVMStreamedDataItemCoverageInfo = RegionCoverageInfoModule.RawLLVMStreamedDataItemCoverageInfo;
  }

  export namespace CoverageInfoFileResolver {
    export type CoverageInfoFileResolver = CoverageInfoFileResolverModule.CoverageInfoFileResolver;
  }

  export namespace CoverageInfoProvider {
    export type CoverageInfoProvider = CoverageInfoProviderModule.CoverageInfoProvider;
  }

  export namespace Extension {
    export type CovertOps = CovertOpsModule.CovertOps;
    export type Decorations = TextEditorModule.Decorations;
    export type TextEditorLike = TextEditorModule.TextEditorLike;
    export type UncoveredCodeRegionsVirtualTextEditor = TextEditorModule.UncoveredCodeRegionsVirtualTextEditor;
  }

  export namespace SettingsProvider {
    export type Settings = SettingsModule.Settings;
    export type SettingsProvider = SettingsProviderModule.SettingsProvider;
  }
}

export namespace Adapters {
  export namespace Node {
    export type CreateReadStreamCallable = FileSystemModule.CreateReadStreamCallable;
    export type ExecFileCallable = ProcessControlModule.ExecFileCallable;
    export type GlobSearchCallable = FileSystemModule.GlobSearchCallable;
    export type MkdirCallable = FileSystemModule.MkdirCallable;
    export type StatCallable = FileSystemModule.StatCallable;
  }

  export namespace Vscode {
    // TODO: remove vscode prefix
    export type DisposableLike = DisposableModule.DisposableLike;
    export type OutputChannelLike = OutputChannelModule.OutputChannelLike;
    export type OutputChannelLikeWithLines = OutputChannelModule.OutputChannelLikeWithLines;
    export type ProgressLike = ProgressModule.ProgressLike;
    export type ProgressStep = ProgressModule.ProgressStep;
    export type TextDocumentContentProviderLike = TextDocumentContentProviderModule.TextDocumentContentProviderLike;
    export type UncoveredCodeRegionsVirtualTextEditor = TextEditorModule.UncoveredCodeRegionsVirtualTextEditor;
    export type VscodeUriLike = WorkspaceModule.VscodeUriLike;
    export type VscodeWorkspaceConfigurationLike = WorkspaceModule.VscodeWorkspaceConfigurationLike;
    export type VscodeWorkspaceFolderLike = WorkspaceModule.VscodeWorkspaceFolderLike;
    export type VscodeWorkspaceLike = WorkspaceModule.VscodeWorkspaceLike;
  }
}

import * as AbstractRegionCoverageInfoModule from "./abstractions/region-coverage-info";
import * as AbstractCoverageSummaryModule from "./abstractions/coverage-summary";
import * as VscodeModule from "../../adapters/abstractions/vscode";
import * as AbstractCoverageInfoModule from "./abstractions/coverage-info";
import * as CoverageInfoCollectorModule from "./abstractions/coverage-info-collector";
import * as SettingsModule from "../settings-provider/abstractions/settings";
import * as FileSystemModule from "../../adapters/abstractions/file-system";
import * as AbstractCoverageInfoFileResolverModule from "../coverage-info-file-resolver/abstractions/coverage-info-file-resolver";

export namespace Domain {
  export namespace Abstractions {
    export type RawLLVMRegionCoverageInfo = AbstractRegionCoverageInfoModule.RawLLVMRegionCoverageInfo;
    export type RegionCoverageInfo = AbstractRegionCoverageInfoModule.RegionCoverageInfo;
    export type RegionRange = AbstractRegionCoverageInfoModule.RegionRange;
    export type CoverageSummary = AbstractCoverageSummaryModule.CoverageSummary;
    export type CoverageInfo = AbstractCoverageInfoModule.CoverageInfo;
    export type RawLLVMFunctionCoverageInfo = AbstractRegionCoverageInfoModule.RawLLVMFunctionCoverageInfo;
    export type RawLLVMRegionsCoverageInfo = AbstractRegionCoverageInfoModule.RawLLVMRegionsCoverageInfo;
    export type RawLLVMFileCoverageInfo = AbstractRegionCoverageInfoModule.RawLLVMFileCoverageInfo;
    export type RawLLVMStreamedDataItemCoverageInfo = AbstractRegionCoverageInfoModule.RawLLVMStreamedDataItemCoverageInfo;
    export type CoverageInfoCollector = CoverageInfoCollectorModule.CoverageInfoCollector;
    export type Settings = SettingsModule.Settings;
    export type CoverageInfoFileResolver = AbstractCoverageInfoFileResolverModule.CoverageInfoFileResolver;
  }
}

export namespace Adapters {
  export namespace Abstractions {
    export namespace vscode {
      export type OutputChannelLike = VscodeModule.OutputChannelLike;
      export type ProgressLike = VscodeModule.ProgressLike;
    }

    export namespace fileSystem {
      export type GlobSearchCallable = FileSystemModule.GlobSearchCallable;
      export type CreateReadStreamCallable = FileSystemModule.CreateReadStreamCallable;
    }
  }
}

import * as AbstractRegionCoverageInfoModule from "./abstractions/region-coverage-info";
import * as AbstractCoverageSummaryModule from "./abstractions/coverage-summary";
import * as VscodeModule from "../../adapters/abstractions/vscode";
import * as AbstractCoverageInfoModule from "./abstractions/coverage-info";
import * as CoverageSummaryModule from "./implementations/coverage-summary";
import * as RegionCoverageInfoModule from "./implementations/region-coverage-info";
import * as DefinitionsModule from "../../extension/definitions";
import * as CoverageInfoCollectorModule from "./abstractions/coverage-info-collector";
import * as CoverageInfoFileResolverModule from "../coverage-info-file-resolver/implementations/coverage-info-file-resolver";
import * as CoverageInfoModule from "./implementations/coverage-info";
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

  export namespace Implementations {
    export class CoverageSummary extends CoverageSummaryModule.CoverageSummary { };

    export namespace RegionCoverageInfo {
      export const make = RegionCoverageInfoModule.make;
    }

    export namespace CoverageInfoFileResolver {
      export const make = CoverageInfoFileResolverModule.make;
    }

    export namespace CoverageInfo {
      export const make = CoverageInfoModule.make;
    }
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

export namespace Extension {
  export namespace Definitions {
    export const extensionNameInSettings = DefinitionsModule.extensionNameInSettings;
  }
}

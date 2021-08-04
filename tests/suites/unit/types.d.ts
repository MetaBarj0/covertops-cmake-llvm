import * as RegionCoverageInfoModule from "../../../src/modules/abstractions/coverage-info-collector/region-coverage-info";
import * as OutputChannelModule from "../../../src/adapters/abstractions/vscode/output-channel";
import * as ProgressModule from "../../../src/adapters/abstractions/vscode/progress";
import * as FileSystemModule from "../../../src/adapters/abstractions/node/file-system";

export namespace Modules {
  export type RegionCoverageInfo = RegionCoverageInfoModule.RegionCoverageInfo;
}

export namespace Adapters {
  export namespace vscode {
    export type OutputChannelLike = OutputChannelModule.OutputChannelLike;
    export type OutputChannelLikeWithLines = OutputChannelModule.OutputChannelLikeWithLines;
    export type ProgressLike = ProgressModule.ProgressLike;
  }

  export namespace FileSystem {
    export type GlobSearchCallable = FileSystemModule.GlobSearchCallable;
  }
}

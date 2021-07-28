import * as RegionCoverageInfoModule from "../../../src/modules/abstractions/region-coverage-info";
import * as VscodeModule from "../../../src/adapters/abstractions/vscode";
import * as FileSystemModule from "../../../src/adapters/abstractions/file-system";


export namespace Modules {
  export type RegionCoverageInfo = RegionCoverageInfoModule.RegionCoverageInfo;
}

export namespace Adapters {
  export namespace vscode {
    export type OutputChannelLike = VscodeModule.OutputChannelLike;
    export type ProgressLike = VscodeModule.ProgressLike;
  }

  export namespace FileSystem {
    export type GlobSearchCallable = FileSystemModule.GlobSearchCallable;
  }
}

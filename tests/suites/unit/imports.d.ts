import * as RegionCoverageInfoModule from "../../../src/modules/abstractions/region-coverage-info";
import * as VscodeAbstractions from "../../../src/adapters/abstractions/vscode";
import * as FileSystemAbstractions from "../../../src/adapters/abstractions/file-system";


export namespace Domain {

  export namespace Abstractions {
    export type RegionCoverageInfo = RegionCoverageInfoModule.RegionCoverageInfo;
  }
}

export namespace Adapters {
  export namespace Abstractions {
    export namespace vscode {
      export type OutputChannelLike = VscodeAbstractions.OutputChannelLike;
      export type ProgressLike = VscodeAbstractions.ProgressLike;
    }

    export namespace FileSystem {
      export type GlobSearchCallable = FileSystemAbstractions.GlobSearchCallable;
    }
  }
}
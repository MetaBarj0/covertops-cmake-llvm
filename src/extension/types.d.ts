// TODO: yet another pass on all types.d.ts
import * as CoverageInfoProviderModule from "../modules/abstractions/coverage-info-provider/coverage-info-provider";
import * as CoverageInfoModule from "../modules/abstractions/coverage-info-collector/coverage-info";
import * as VscodeModule from "../adapters/abstractions/vscode";
import * as CovertOpsModule from "./abstractions/covert-ops";

export namespace Adapters {
  export namespace vscode {
    export type ProgressLike = VscodeModule.ProgressLike;
    export type OutputChannelLike = VscodeModule.OutputChannelLike;
    export type OutputChannelLikeWithLines = VscodeModule.OutputChannelLikeWithLines;
    export type UncoveredCodeRegionsVirtualTextEditor = VscodeModule.UncoveredCodeRegionsVirtualTextEditor;
  }
}

export namespace Modules {
  export type CoverageInfoProvider = CoverageInfoProviderModule.CoverageInfoProvider;
  export type CoverageInfo = CoverageInfoModule.CoverageInfo;
}

export namespace Extension {
  export type UncoveredCodeRegionsVirtualTextEditor = VscodeModule.UncoveredCodeRegionsVirtualTextEditor;
  export type Decorations = VscodeModule.Decorations;
  export type CovertOps = CovertOpsModule.CovertOps;
  export type TextEditorLike = VscodeModule.TextEditorLike;
}

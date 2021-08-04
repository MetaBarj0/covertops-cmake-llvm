// TODO: yet another pass on all types.d.ts
import * as CoverageInfoProviderModule from "../modules/abstractions/coverage-info-provider/coverage-info-provider";
import * as CoverageInfoModule from "../modules/abstractions/coverage-info-collector/coverage-info";
import * as OutputChannelModule from "../adapters/abstractions/vscode/output-channel";
import * as TextEditorModule from "../adapters/abstractions/vscode/text-editor";
import * as ProgressModule from "../adapters/abstractions/vscode/progress";
import * as CovertOpsModule from "./abstractions/covert-ops";

export namespace Adapters {
  export namespace vscode {
    export type ProgressLike = ProgressModule.ProgressLike;
    export type OutputChannelLike = OutputChannelModule.OutputChannelLike;
    export type OutputChannelLikeWithLines = OutputChannelModule.OutputChannelLikeWithLines;
    export type UncoveredCodeRegionsVirtualTextEditor = TextEditorModule.UncoveredCodeRegionsVirtualTextEditor;
  }
}

export namespace Modules {
  export type CoverageInfoProvider = CoverageInfoProviderModule.CoverageInfoProvider;
  export type CoverageInfo = CoverageInfoModule.CoverageInfo;
}

export namespace Extension {
  export type UncoveredCodeRegionsVirtualTextEditor = TextEditorModule.UncoveredCodeRegionsVirtualTextEditor;
  export type Decorations = TextEditorModule.Decorations;
  export type CovertOps = CovertOpsModule.CovertOps;
  export type TextEditorLike = TextEditorModule.TextEditorLike;
}

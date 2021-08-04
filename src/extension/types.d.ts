import * as CoverageInfoProviderModule from "../modules/abstractions/coverage-info-provider";
import * as CoverageInfoModule from "../modules/abstractions/coverage-info";
import * as VscodeModule from "../adapters/abstractions/vscode";
import * as UncoveredCodeRegionsVirtualTextEditorModule from "./abstractions/uncovered-code-regions-virtual-text-editor";
import * as CovertOpsModule from "./abstractions/covert-ops";
import * as TextEditorLikeModule from "./abstractions/text-editor-like";

export namespace Adapters {
  export namespace vscode {
    export type ProgressLike = VscodeModule.ProgressLike;
    export type OutputChannelLike = VscodeModule.OutputChannelLike;
    export type OutputChannelLikeWithLines = VscodeModule.OutputChannelLikeWithLines;
  }
}

export namespace Modules {
  export type CoverageInfoProvider = CoverageInfoProviderModule.CoverageInfoProvider;
  export type CoverageInfo = CoverageInfoModule.CoverageInfo;
}

export namespace Extension {
  export type UncoveredCodeRegionsVirtualTextEditor = UncoveredCodeRegionsVirtualTextEditorModule.UncoveredCodeRegionsVirtualTextEditor;
  export type Decorations = UncoveredCodeRegionsVirtualTextEditorModule.Decorations;
  export type CovertOps = CovertOpsModule.CovertOps;
  export type TextEditorLike = TextEditorLikeModule.TextEditorLike;
}

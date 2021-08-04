import * as CovModule from "../../../src/extension/abstractions/covert-ops";
import * as VscodeModule from "../../../src/adapters/abstractions/vscode";

export namespace Extension {
  export type UncoveredCodeRegionsVirtualTextEditor = VscodeModule.UncoveredCodeRegionsVirtualTextEditor;
  export type CovertOps = CovModule.CovertOps;
  export type TextEditorLike = VscodeModule.TextEditorLike;
}

export namespace Adapters {
  export namespace vscode {
    export type OutputChannelLike = VscodeModule.OutputChannelLike;
  }
}

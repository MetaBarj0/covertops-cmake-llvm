// TODO: only one types.d.ts at root src dir
import * as CovModule from "../../../src/modules/abstractions/extension/covert-ops";
import * as TextEditorModule from "../../../src/adapters/abstractions/vscode/text-editor";
import * as OutputChannelModule from "../../../src/adapters/abstractions/vscode/output-channel";

export namespace Extension {
  export type UncoveredCodeRegionsVirtualTextEditor = TextEditorModule.UncoveredCodeRegionsVirtualTextEditor;
  export type CovertOps = CovModule.CovertOps;
  export type TextEditorLike = TextEditorModule.TextEditorLike;
}

export namespace Adapters {
  export namespace vscode {
    export type OutputChannelLike = OutputChannelModule.OutputChannelLike;
  }
}

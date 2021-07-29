import * as UncoveredCodeRegionsVirtualTextEditorModule from "../../../src/extension/abstractions/uncovered-code-regions-virtual-text-editor";
import * as CovModule from "../../../src/extension/abstractions/cov";
import * as VscodeModule from "../../../src/adapters/abstractions/vscode";

export namespace Extension {
  export type UncoveredCodeRegionsVirtualTextEditor = UncoveredCodeRegionsVirtualTextEditorModule.UncoveredCodeRegionsVirtualTextEditor;
  export type Cov = CovModule.Cov;
}

export namespace Adapters {
  export namespace vscode {
    export type OutputChannelLike = VscodeModule.OutputChannelLike;
  }
}

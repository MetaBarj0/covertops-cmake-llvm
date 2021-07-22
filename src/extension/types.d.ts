import * as CoverageInfoProviderModule from "../modules/abstractions/coverage-info-provider";
import * as CoverageInfoModule from "../modules/abstractions/coverage-info";
import * as VscodeModule from "../adapters/abstractions/vscode";
import * as TextEditorWithDecorationsModule from "./abstractions/text-editor-with-decorations";

export namespace Adapters {
  // TODO, Abstractions sub namespace is not necessary anymore in all types.d.ts files
  export namespace Abstractions {
    export namespace vscode {
      export type ProgressLike = VscodeModule.ProgressLike;
      export type OutputChannelLike = VscodeModule.OutputChannelLike;
    }
  }
}

export namespace Modules {
  export type CoverageInfoProvider = CoverageInfoProviderModule.CoverageInfoProvider;
  export type CoverageInfo = CoverageInfoModule.CoverageInfo;
}

export namespace Extension {
  export type TextEditorWithDecorations = TextEditorWithDecorationsModule.TextEditorWithDecorations;
  export type Decorations = TextEditorWithDecorationsModule.Decorations;
}
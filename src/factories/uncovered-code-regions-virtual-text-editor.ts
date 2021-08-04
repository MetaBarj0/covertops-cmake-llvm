import * as Types from "../modules/types";

import * as UncoveredCodeRegionsVirtualTextEditor from "../adapters/implementations/vscode/uncovered-code-regions-virtual-text-editor";

export function make(): (textEditor: Types.Extension.TextEditorLike) => Types.Extension.UncoveredCodeRegionsVirtualTextEditor {
  return textEditor => UncoveredCodeRegionsVirtualTextEditor.make(textEditor);
}

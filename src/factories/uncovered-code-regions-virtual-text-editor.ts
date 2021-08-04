import * as Types from "../extension/types";

import * as UncoveredCodeRegionsVirtualTextEditor from "../extension/implementations/uncovered-code-regions-virtual-text-editor";

export function make(): (textEditor: Types.Extension.TextEditorLike) => Types.Extension.UncoveredCodeRegionsVirtualTextEditor {
  return textEditor => UncoveredCodeRegionsVirtualTextEditor.make(textEditor);
}

import * as Types from "../types";

import * as UncoveredCodeRegionsVirtualTextEditor from "../modules/implementations/extension/uncovered-code-regions-virtual-text-editor";

export function make(): (textEditor: Types.Modules.Extension.TextEditorLike) => Types.Modules.Extension.UncoveredCodeRegionsVirtualTextEditor {
  return textEditor => UncoveredCodeRegionsVirtualTextEditor.make(textEditor);
}

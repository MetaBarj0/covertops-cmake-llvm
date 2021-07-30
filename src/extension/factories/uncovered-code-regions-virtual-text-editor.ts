import * as Types from "../types";

import { UncoveredCodeRegionsVirtualTextEditor } from "../implementations/uncovered-code-regions-virtual-text-editor";

export function make(): (textEditor: Types.Extension.TextEditorLike) => Types.Extension.UncoveredCodeRegionsVirtualTextEditor {
  return textEditor => new UncoveredCodeRegionsVirtualTextEditor(textEditor);
}

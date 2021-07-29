import * as Types from "../types";

import { UncoveredCodeRegionsVirtualTextEditor } from "../implementations/uncovered-code-regions-virtual-text-editor";

import * as vscode from "vscode";

export function make(): (textEditor: vscode.TextEditor) => Types.Extension.UncoveredCodeRegionsVirtualTextEditor {
  return textEditor => new UncoveredCodeRegionsVirtualTextEditor(textEditor);
}

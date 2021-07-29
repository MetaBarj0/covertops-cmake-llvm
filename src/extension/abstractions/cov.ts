import { OutputChannelLike } from "../../adapters/abstractions/vscode";

import * as vscode from "vscode";
import { UncoveredCodeRegionsVirtualTextEditor } from "./uncovered-code-regions-virtual-text-editor";

export type Cov = {
  run(): Thenable<void>;
  dispose(): void;
  get asDisposable(): vscode.Disposable;
  get outputChannel(): OutputChannelLike
  get uncoveredCodeRegionsVirtualTextEditors(): ReadonlyMap<string, UncoveredCodeRegionsVirtualTextEditor>;
}

import * as Types from "../../../types";

import * as vscode from "vscode";

export type CovertOps = {
  run(): Thenable<void>;
  dispose(): void;
  get asDisposable(): vscode.Disposable;
  get outputChannel(): Types.Adapters.Vscode.OutputChannelLikeWithLines
  get uncoveredCodeRegionsVirtualTextEditors(): ReadonlyMap<string, Types.Modules.Extension.UncoveredCodeRegionsVirtualTextEditor>;
}

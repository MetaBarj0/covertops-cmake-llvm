import * as Types from "../../../types";

export function make(wrappedOutputChannel: Types.Adapters.Vscode.OutputChannelLike): Types.Adapters.Vscode.OutputChannelLikeWithLines {
  return new OutputChannel(wrappedOutputChannel);
}

class OutputChannel implements Types.Adapters.Vscode.OutputChannelLikeWithLines {
  constructor(wrappedOutputChannel: Types.Adapters.Vscode.OutputChannelLike) {
    this.wrapped = wrappedOutputChannel;
  }

  appendLine(line: string) {
    this.wrapped.appendLine(line);
    this.lines_.push(line);
  }

  dispose() {
    this.wrapped.dispose();
  }

  clear(): void {
    this.wrapped.clear();
    this.lines_ = [];
  }

  show(preserveFocus: boolean): void {
    this.wrapped.show(preserveFocus);
  }

  get lines(): readonly string[] {
    return this.lines_;
  }

  private readonly wrapped: Types.Adapters.Vscode.OutputChannelLike;
  private lines_: Array<string> = [];
}

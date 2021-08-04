import * as Types from "../types";

export function make(wrappedOutputChannel: Types.Adapters.vscode.OutputChannelLike): Types.Adapters.vscode.OutputChannelLikeWithLines {
  return new OutputChannel(wrappedOutputChannel);
}

class OutputChannel implements Types.Adapters.vscode.OutputChannelLikeWithLines {
  constructor(wrappedOutputChannel: Types.Adapters.vscode.OutputChannelLike) {
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

  private readonly wrapped: Types.Adapters.vscode.OutputChannelLike;
  private lines_: Array<string> = [];
}

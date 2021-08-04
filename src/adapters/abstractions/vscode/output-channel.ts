// TODO: look if it can be hidden
export type OutputChannelLike = {
  appendLine(line: string): void;
  dispose(): void;
  clear(): void;
  show(preserveFocus: boolean): void;
};

type WithLines = {
  get lines(): ReadonlyArray<string>;
}

export type OutputChannelLikeWithLines = OutputChannelLike & WithLines;

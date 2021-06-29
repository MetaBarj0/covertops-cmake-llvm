// TODO: move in adapters' interface folder
export type ProgressLike = {
  report(value: ProgressStep): void;
};

type ProgressStep = {
  message?: string,
  increment?: number
};
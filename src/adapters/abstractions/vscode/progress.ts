export type ProgressLike = {
  report(value: ProgressStep): void;
};

export type ProgressStep = {
  message?: string,
  increment?: number
};

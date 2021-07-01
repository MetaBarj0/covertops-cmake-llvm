export type ExecFileExceptionLike = {
  message: string;
};

export type ExecFileOptionsLike = {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
};

export type ExecFileCallable = (file: string,
  args: ReadonlyArray<string> | undefined | null,
  options: ExecFileOptionsLike,
  callback: (error: ExecFileExceptionLike | null, stdout: string, stderr: string) => void
) => void;
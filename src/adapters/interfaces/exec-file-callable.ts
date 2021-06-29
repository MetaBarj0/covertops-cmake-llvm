type ProcessLike = {
  execFile(
    file: string,
    args: ReadonlyArray<string> | undefined | null,
    options: ExecFileOptionsLike,
    callback: (error: ExecFileExceptionLike | null, stdout: string, stderr: string) => void
  ): ChildProcessLike;
};

// TODO: check if export is necessary
export type ExecFileExceptionLike = {
  message: string;
};

// TODO: check if export is necessary
export type ExecFileOptionsLike = {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
};

// TODO: check if export is necessary
export type ChildProcessLike = void;

export type ExecFileCallable = (file: string,
  args: ReadonlyArray<string> | undefined | null,
  options: ExecFileOptionsLike,
  callback: (error: ExecFileExceptionLike | null, stdout: string, stderr: string) => void
) => ChildProcessLike;
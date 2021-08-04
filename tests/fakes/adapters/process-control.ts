import { ExecFileExceptionLike, ExecFileOptionsLike, ExecFileCallable } from "../../../src/adapters/abstractions/node/process-control";

export function buildFakeFailingProcess(failureStage?: FailureStages): ExecFileCallable {
  const maxSuccessfulCallCount = failureStage ? <number>failureStage : 0;
  let currentCallCount = 0;

  return (_file: string,
    _args: readonly string[] | null | undefined,
    _options: ExecFileOptionsLike,
    callback: (error: ExecFileExceptionLike | null,
      stdout: string, stderr: string) => void) => {
    if (currentCallCount >= maxSuccessfulCallCount)
      callback(
        new class implements ExecFileExceptionLike {
          message = "Epic Fail!";
        },
        "Epic Fail!",
        "Epic Fail!");
    else
      callback(null, "Epic Success!", "");

    ++currentCallCount;
  };
}

export function buildFakeSucceedingProcess(): ExecFileCallable {
  return (_file: string,
    _args: readonly string[] | null | undefined,
    _options: ExecFileOptionsLike,
    callback: (error: ExecFileExceptionLike | null,
      stdout: string, stderr: string) => void) => {
    callback(null, "Epic Success!", "");
  };
}

export enum FailureStages {
  reach = 0,
  generate = 1,
  build = 2
}

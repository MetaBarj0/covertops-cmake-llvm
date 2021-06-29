// TODO: module import syntax
import { ChildProcessLike, ExecFileExceptionLike, ExecFileOptionsLike, ExecFileCallable } from '../../../src/adapters/interfaces/exec-file-callable';

export namespace process {
  export function buildFakeFailingProcess(): ExecFileCallable {
    return (_file: string,
      _args: readonly string[] | null | undefined,
      _options: ExecFileOptionsLike,
      callback: (error: ExecFileExceptionLike | null,
        stdout: string, stderr: string) => void) => {
      callback(
        new class implements ExecFileExceptionLike {
          message = 'Epic fail!';
        },
        'stdout',
        'stderr');
    };
  }

  export function buildFakeSucceedingProcess(): ExecFileCallable {
    return (_file: string,
      _args: readonly string[] | null | undefined,
      _options: ExecFileOptionsLike,
      callback: (error: ExecFileExceptionLike | null,
        stdout: string, stderr: string) => void) => {
      callback(null, 'epic success!', '');
    };
  }
}

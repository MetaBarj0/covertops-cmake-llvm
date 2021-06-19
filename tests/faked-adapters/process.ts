import * as Cmake from '../../src/domain/services/internal/cmake';

export namespace process {
  export function buildFakeFailingProcess() {
    return new class implements Cmake.ProcessLike {
      execFile(
        _file: string,
        _args: readonly string[] | null | undefined,
        _options: Cmake.ExecFileOptionsLike,
        callback: (error: Cmake.ExecFileExceptionLike | null,
          stdout: string, stderr: string) => void): Cmake.ChildProcessLike {
        callback(
          new class implements Cmake.ExecFileExceptionLike {
            message = 'Epic fail!';
          },
          'stdout',
          'stderr');

        return new class implements Cmake.ChildProcessLike { };
      }
    };
  }

  export function buildFakeSucceedingProcess() {
    return new class implements Cmake.ProcessLike {
      execFile(
        _file: string,
        _args: readonly string[] | null | undefined,
        _options: Cmake.ExecFileOptionsLike,
        callback: (error: Cmake.ExecFileExceptionLike | null,
          stdout: string, stderr: string) => void): Cmake.ChildProcessLike {
        callback(null, 'epic success!', '');

        return new class implements Cmake.ChildProcessLike { };
      }
    };
  }
}

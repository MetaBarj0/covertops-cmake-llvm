import * as BuildSystemGenerator from '../../src/domain/services/internal/build-system-generator';

export namespace process {
  export function buildFakeFailingProcess() {
    return new class implements BuildSystemGenerator.ProcessLike {
      execFile(
        _file: string,
        _args: readonly string[] | null | undefined,
        _options: BuildSystemGenerator.ExecFileOptionsLike,
        callback: (error: BuildSystemGenerator.ExecFileExceptionLike | null,
          stdout: string, stderr: string) => void): BuildSystemGenerator.ChildProcessLike {
        callback(
          new class implements BuildSystemGenerator.ExecFileExceptionLike {
            message = 'Epic fail!';
          },
          'stdout',
          'stderr');

        return new class implements BuildSystemGenerator.ChildProcessLike { };
      }
    };
  }

  export function buildFakeSucceedingProcess() {
    return new class implements BuildSystemGenerator.ProcessLike {
      execFile(
        _file: string,
        _args: readonly string[] | null | undefined,
        _options: BuildSystemGenerator.ExecFileOptionsLike,
        callback: (error: BuildSystemGenerator.ExecFileExceptionLike | null,
          stdout: string, stderr: string) => void): BuildSystemGenerator.ChildProcessLike {
        callback(null, 'epic success!', '');

        return new class implements BuildSystemGenerator.ChildProcessLike { };
      }
    };
  }
}

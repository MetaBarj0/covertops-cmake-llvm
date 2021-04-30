import { SettingsProvider, VscodeWorkspaceLike } from './settings-provider';

export type ExecFileExceptionLike = {
  message: string;
};

export type ExecFileOptionsLike = {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
};

export type ChildProcessLike = {};

export type ProcessLike = {
  execFile(
    file: string,
    args: ReadonlyArray<string> | undefined | null,
    options: ExecFileOptionsLike,
    callback: (error: ExecFileExceptionLike | null, stdout: string, stderr: string) => void
  ): ChildProcessLike;
};

export class Cmake {
  constructor(workspace: VscodeWorkspaceLike, process: ProcessLike) {
    this.process = process;
    this.workspace = workspace;
  }

  buildTarget(): Promise<void> {
    return new Promise((resolve, reject) => {
      const settings = new SettingsProvider(this.workspace).settings;
      const cmakeCommand = settings.cmakeCommand;

      this.process.execFile(
        cmakeCommand, ['--version'], {},
        (error, _stdout, _stderr) => {
          if (error)
            return reject(new Error(
              "Cannot find the cmake command. Ensure the 'cmake-llvm-coverage: Cmake Command' " +
              'setting is correctly set. Have you verified your PATH environment variable?'));
        });

      const build = settings.buildTreeDirectory;
      const target = settings.cmakeTarget;

      this.process.execFile(
        cmakeCommand, ['--build', build, '--target', target], {},
        (error, _stdout, _stderr) => {
          if (error)
            return reject(new Error(
              `Cannot build the cmake target: '${target}'. Make sure the ` +
              "'cmake-llvm-coverage: Cmake Target' setting is correctly set."));
        });

      resolve();
    });
  }

  private readonly process: ProcessLike;
  private readonly workspace: VscodeWorkspaceLike;
};

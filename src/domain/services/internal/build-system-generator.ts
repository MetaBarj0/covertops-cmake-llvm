import * as definitions from '../../../definitions';
import * as SettingsProvider from './settings-provider';

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

type Adapters = {
  workspace: SettingsProvider.VscodeWorkspaceLike,
  processForCommand: ProcessLike,
  processForTarget: ProcessLike
};

export function make(adapters: Adapters) {
  return new BuildSystemGenerator(adapters);
}

class BuildSystemGenerator {
  constructor(adapters: Adapters) {
    this.workspace = adapters.workspace;
    this.processForCommand = adapters.processForCommand;
    this.processForTarget = adapters.processForTarget;
  }

  async buildTarget(): Promise<void> {
    await this.ensureCommandIsReachable();
    await this.generate();

    return this.build();
  }

  private ensureCommandIsReachable(): Promise<void> {
    return this.executeCommandWith({
      process: this.processForCommand,
      arguments: ['--version'],
      potentialErrorMessage:
        `Cannot find the cmake command. Ensure the '${definitions.extensionNameInSettings}: Cmake Command' ` +
        'setting is correctly set. Have you verified your PATH environment variable?'
    });
  }

  private generate(): Promise<void> {
    const settings = SettingsProvider.make(this.workspace).settings;
    const build = settings.buildTreeDirectory;
    const source = settings.rootDirectory;

    return this.executeCommandWith({
      process: this.processForTarget,
      arguments: ['-B', build, '-S', source, ...settings.additionalCmakeOptions],
      potentialErrorMessage:
        `Error: Could not build the specified cmake target ${settings.cmakeTarget}. ` +
        `Ensure '${definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`
    });
  }

  private build(): Promise<void> {
    const settings = SettingsProvider.make(this.workspace).settings;
    const build = settings.buildTreeDirectory;
    const target = settings.cmakeTarget;

    return this.executeCommandWith({
      process: this.processForTarget,
      arguments: ['--build', build, '--target', target],
      potentialErrorMessage:
        `Error: Could not build the specified cmake target ${settings.cmakeTarget}. ` +
        `Ensure '${definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`
    });
  }

  private executeCommandWith(options: { process: ProcessLike, arguments: ReadonlyArray<string>, potentialErrorMessage: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      const settings = SettingsProvider.make(this.workspace).settings;
      const cmakeCommand = settings.cmakeCommand;

      options.process.execFile(
        cmakeCommand, options.arguments,
        {
          cwd: settings.rootDirectory,
          env: process.env
        },
        (error, stdout, stderr) => {
          if (error)
            return reject(new Error(
              `${options.potentialErrorMessage}\n${error.message}\n${stderr}\n${stdout}`));

          resolve();
        });
    });
  }

  private readonly processForCommand: ProcessLike;
  private readonly processForTarget: ProcessLike;
  private readonly workspace: SettingsProvider.VscodeWorkspaceLike;
};
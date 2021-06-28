import * as definitions from '../../../definitions';
import * as SettingsProvider from './settings-provider';
import * as ProgressReporter from './progress-reporter';
import * as ErrorChannel from './error-channel';
import { SettingsContract } from '../../interfaces/settings-contract';
import { VscodeWorkspaceLike } from '../../../adapters/interfaces/vscode-workspace-like';

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
  workspace: VscodeWorkspaceLike,
  processForCommand: ProcessLike,
  processForTarget: ProcessLike,
  progressReporter: ProgressReporter.ProgressLike,
  errorChannel: ErrorChannel.OutputChannelLike
};

export function make(adapters: Adapters) {
  return new Cmake(adapters);
}

class Cmake {
  constructor(adapters: Adapters) {
    this.processForCommand = adapters.processForCommand;
    this.processForTarget = adapters.processForTarget;
    this.progressReporter = adapters.progressReporter;
    this.errorChannel = adapters.errorChannel;

    this.settings = SettingsProvider.make({ workspace: adapters.workspace, errorChannel: adapters.errorChannel }).settings;
  }

  async buildTarget() {
    await this.ensureCommandIsReachable();
    this.progressReporter.report({
      message: 'Found an invocable cmake command.',
      increment: 100 / 6 * 2
    });

    await this.generate();
    this.progressReporter.report({
      message: 'Generated the cmake project.',
      increment: 100 / 6 * 3
    });

    await this.build();
    this.progressReporter.report({
      message: 'Built the target.',
      increment: 100 / 6 * 4
    });
  }

  private ensureCommandIsReachable() {
    return this.executeCommandWith({
      process: this.processForCommand,
      arguments: ['--version'],
      potentialErrorMessage:
        `Cannot find the cmake command. Ensure the '${definitions.extensionNameInSettings}: Cmake Command' ` +
        'setting is correctly set. Have you verified your PATH environment variable?'
    });
  }

  private generate() {
    const build = this.settings.buildTreeDirectory;
    const source = this.settings.rootDirectory;

    return this.executeCommandWith({
      process: this.processForTarget,
      arguments: ['-B', build, '-S', source, ...this.settings.additionalCmakeOptions],
      potentialErrorMessage:
        `Error: Could not build the specified cmake target ${this.settings.cmakeTarget}. ` +
        `Ensure '${definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`
    });
  }

  private build() {
    const build = this.settings.buildTreeDirectory;
    const target = this.settings.cmakeTarget;

    return this.executeCommandWith({
      process: this.processForTarget,
      arguments: ['--build', build, '--target', target],
      potentialErrorMessage:
        `Error: Could not build the specified cmake target ${this.settings.cmakeTarget}. ` +
        `Ensure '${definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`
    });
  }

  private executeCommandWith(options: { process: ProcessLike, arguments: ReadonlyArray<string>, potentialErrorMessage: string }) {
    return new Promise<void>((resolve, reject) => {
      const cmakeCommand = this.settings.cmakeCommand;

      options.process.execFile(
        cmakeCommand, options.arguments,
        {
          cwd: this.settings.rootDirectory,
          env: process.env
        },
        (error, stdout, stderr) => {
          if (!error)
            return resolve();

          const errorMessage = `${options.potentialErrorMessage}\n${error.message}\n${stderr}\n${stdout}`;

          this.errorChannel.appendLine(errorMessage);

          return reject(new Error(errorMessage));
        });
    });
  }

  private readonly processForCommand: ProcessLike;
  private readonly processForTarget: ProcessLike;
  private readonly progressReporter: ProgressReporter.ProgressLike;
  private readonly errorChannel: ErrorChannel.OutputChannelLike;
  private readonly settings: SettingsContract;
};

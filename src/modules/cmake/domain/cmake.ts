import { ExecFileCallable } from '../../../shared-kernel/abstractions/process-control';
import { OutputChannelLike, ProgressLike } from '../../../shared-kernel/abstractions/vscode';

import * as definitions from '../../../extension/definitions';
import { BasicCmake } from './basic-cmake';
// TODO: import module syntax???
import { Settings } from '../../settings-provider/abstractions/domain/settings';
import * as Abstractions from '../abstractions/domain/cmake';

type Adapters = {
  settings: Settings,
  vscode: {
    progressReporter: ProgressLike,
    errorChannel: OutputChannelLike,
  },
  processControl: {
    execFileForCommand: ExecFileCallable,
    execFileForTarget: ExecFileCallable,
  }
};

export function make(adapters: Adapters): Abstractions.Cmake {
  return new Cmake(adapters);
}

class Cmake extends BasicCmake implements Abstractions.Cmake {
  constructor(adapters: Adapters) {
    super(adapters.vscode.progressReporter);

    this.execFileForCommand = adapters.processControl.execFileForCommand;
    this.execFileForTarget = adapters.processControl.execFileForTarget;
    this.errorChannel = adapters.vscode.errorChannel;

    this.settings = adapters.settings;
  }

  protected reachCommand() {
    return this.executeCommandWith({
      execFile: this.execFileForCommand,
      arguments: ['--version'],
      potentialErrorMessage:
        `Cannot find the cmake command. Ensure the '${definitions.extensionNameInSettings}: Cmake Command' ` +
        'setting is correctly set. Have you verified your PATH environment variable?'
    });
  }

  protected override generateProject() {
    const build = this.settings.buildTreeDirectory;
    const source = this.settings.rootDirectory;

    return this.executeCommandWith({
      execFile: this.execFileForTarget,
      arguments: ['-B', build, '-S', source, ...this.settings.additionalCmakeOptions],
      potentialErrorMessage:
        `Error: Could not build the specified cmake target ${this.settings.cmakeTarget}. ` +
        `Ensure '${definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`
    });
  }

  protected override build() {
    const build = this.settings.buildTreeDirectory;
    const target = this.settings.cmakeTarget;

    return this.executeCommandWith({
      execFile: this.execFileForTarget,
      arguments: ['--build', build, '--target', target],
      potentialErrorMessage:
        `Error: Could not build the specified cmake target ${this.settings.cmakeTarget}. ` +
        `Ensure '${definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`
    });
  }

  private executeCommandWith(options: { execFile: ExecFileCallable, arguments: ReadonlyArray<string>, potentialErrorMessage: string }) {
    return new Promise<void>((resolve, reject) => {
      const cmakeCommand = this.settings.cmakeCommand;

      options.execFile(
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

  private readonly execFileForCommand: ExecFileCallable;
  private readonly execFileForTarget: ExecFileCallable;
  private readonly errorChannel: OutputChannelLike;
  private readonly settings: Settings;
};

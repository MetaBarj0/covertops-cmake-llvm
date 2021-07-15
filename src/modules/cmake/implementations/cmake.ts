import * as Imports from '../imports';

export abstract class BasicCmake implements Imports.Domain.Abstractions.Cmake {
  constructor(errorChannel: Imports.Adapters.Abstractions.vscode.OutputChannelLike,
    progressReporter: Imports.Adapters.Abstractions.vscode.ProgressLike,
    settings: Imports.Domain.Abstractions.Settings) {
    this.errorChannel = errorChannel;
    this.progressReporter = progressReporter;
    this.settings = settings;
  }

  async buildTarget(): Promise<void> {
    try {
      await this.reachCommand();

      this.progressReporter.report({
        message: 'Found an invocable cmake command.'
      });
    } catch (error) {
      return this.handleErrorWithMessage(error,
        `Cannot find the cmake command. Ensure the '${Imports.Extension.Definitions.extensionNameInSettings}: Cmake Command' ` +
        'setting is correctly set. Have you verified your PATH environment variable?');
    }

    try {
      await this.generateProject();

      this.progressReporter.report({
        message: 'Generated the cmake project.'
      });
    } catch (error) {
      return this.handleErrorWithMessage(error,
        'Cannot generate the cmake project in the ' +
        `${this.settings.rootDirectory} directory. ` +
        'Ensure either you have opened a valid cmake project, or the cmake project has not already been generated using different options. ' +
        `You may have to take a look in '${Imports.Extension.Definitions.extensionNameInSettings}: Additional Cmake Options' settings ` +
        'and check the generator used is correct for instance.');
    }

    try {
      await this.build();

      this.progressReporter.report({
        message: 'Built the target.'
      });
    } catch (error) {
      return this.handleErrorWithMessage(error,
        `Error: Could not build the specified cmake target ${this.settings.cmakeTarget}. ` +
        `Ensure '${Imports.Extension.Definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`);
    }
  }

  protected abstract reachCommand(): Thenable<void>;
  protected abstract generateProject(): Thenable<void>;
  protected abstract build(): Thenable<void>;

  protected readonly settings: Imports.Domain.Abstractions.Settings;

  private handleErrorWithMessage(error: Error, message: string) {
    const errorMessage = `${message}${(<Error>error).message}`;

    this.errorChannel.appendLine(errorMessage);

    return Promise.reject(new Error(errorMessage));
  }

  private readonly progressReporter: Imports.Adapters.Abstractions.vscode.ProgressLike;
  private readonly errorChannel: Imports.Adapters.Abstractions.vscode.OutputChannelLike;
}

export function make(context: Context): Imports.Domain.Abstractions.Cmake {
  return new Cmake(context);
}

class Cmake extends BasicCmake implements Imports.Domain.Abstractions.Cmake {
  constructor(context: Context) {
    super(context.errorChannel, context.progressReporter, context.settings);

    this.execFile = context.execFile;
  }

  protected reachCommand() {
    return this.executeCommandWith({
      arguments: ['--version']
    });
  }

  protected override generateProject() {
    const build = this.settings.buildTreeDirectory;
    const source = this.settings.rootDirectory;

    return this.executeCommandWith({
      arguments: ['-B', build, '-S', source, ...this.settings.additionalCmakeOptions]
    });
  }

  protected override build() {
    const build = this.settings.buildTreeDirectory;
    const target = this.settings.cmakeTarget;

    return this.executeCommandWith({
      arguments: ['--build', build, '--target', target]
    });
  }

  private executeCommandWith(options: {
    arguments: ReadonlyArray<string>
  }) {
    return new Promise<void>((resolve, reject) => {
      const cmakeCommand = this.settings.cmakeCommand;

      this.execFile(
        cmakeCommand, options.arguments,
        {
          cwd: this.settings.rootDirectory,
          env: process.env
        },
        (error, stdout, stderr) => {
          if (!error)
            return resolve();

          const errorMessage = `\n${error.message}\n${stderr}\n${stdout}`;

          return reject(new Error(errorMessage));
        });
    });
  }

  private readonly execFile: Imports.Adapters.Abstractions.processControl.ExecFileCallable;
};

type Context = {
  settings: Imports.Domain.Abstractions.Settings,
  progressReporter: Imports.Adapters.Abstractions.vscode.ProgressLike,
  errorChannel: Imports.Adapters.Abstractions.vscode.OutputChannelLike,
  execFile: Imports.Adapters.Abstractions.processControl.ExecFileCallable,
};

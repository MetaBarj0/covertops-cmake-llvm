import * as Imports from '../../imports';

import * as Definitions from '../../../../extension/definitions';

export abstract class BasicCmake implements Imports.Domain.Abstractions.Cmake {
  constructor(progressReporter: Imports.Adapters.Abstractions.vscode.ProgressLike,
    settings: Imports.Domain.Abstractions.Settings,
    errorChannel: Imports.Adapters.Abstractions.vscode.OutputChannelLike) {
    this.progressReporter = progressReporter;
    this.settings = settings;
    this.errorChannel = errorChannel;
  }

  async buildTarget(): Promise<void> {
    try {
      await this.reachCommand();

      this.progressReporter.report({
        message: 'Found an invocable cmake command.',
        // TODO: meh, bad progress creating temporal coupling between components
        increment: 100 / 6 * 2
      });
    } catch (error) {
      return this.handleErrorWithMessage(error,
        `Cannot find the cmake command. Ensure the '${Definitions.extensionNameInSettings}: Cmake Command' ` +
        'setting is correctly set. Have you verified your PATH environment variable?');
    }

    try {
      await this.generateProject();

      this.progressReporter.report({
        message: 'Generated the cmake project.',
        increment: 100 / 6 * 3
      });
    } catch (error) {
      return this.handleErrorWithMessage(error,
        'Cannot generate the cmake project in the ' +
        `${this.settings.rootDirectory} directory. ` +
        'Ensure either you have opened a valid cmake project, or the cmake project has not already been generated using different options. ' +
        `You may have to take a look in '${Definitions.extensionNameInSettings}: Additional Cmake Options' settings ` +
        'and check the generator used is correct for instance.');
    }

    try {
      await this.build();

      this.progressReporter.report({
        message: 'Built the target.',
        increment: 100 / 6 * 4
      });
    } catch (error) {
      return this.handleErrorWithMessage(error,
        `Error: Could not build the specified cmake target ${this.settings.cmakeTarget}. ` +
        `Ensure '${Definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`);
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
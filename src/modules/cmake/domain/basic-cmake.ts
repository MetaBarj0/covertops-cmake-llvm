import { ProgressLike } from '../../../adapters/interfaces/vscode';

// TODO: move in domain folder
import * as Abstractions from '../abstractions/domain/cmake';

export abstract class BasicCmake implements Abstractions.Cmake {
  constructor(progressReporter: ProgressLike) {
    this.progressReporter = progressReporter;
  }

  async buildTarget(): Promise<void> {
    await this.reachCommand();
    this.progressReporter.report({
      message: 'Found an invocable cmake command.',
      // TODO: meh, bad progress creating temporal coupling between components
      increment: 100 / 6 * 2
    });

    await this.generateProject();
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

  protected abstract reachCommand(): Thenable<void>;
  protected abstract generateProject(): Thenable<void>;
  protected abstract build(): Thenable<void>;

  private readonly progressReporter: ProgressLike;
}
import { extensionId, extensionDisplayName } from '../../definitions';
import * as DecorationLocationProvider from '../../../src/extension/factories/decoration-location-provider';

import { commands, Disposable, OutputChannel, ProgressLocation, window } from 'vscode';

export class Cov {
  constructor() {
    this.output = window.createOutputChannel(extensionId);

    this.command = commands.registerCommand(`${extensionId}.reportUncoveredCodeRegionsInFile`, this.runDecorationLocationsProvider, this);
  }

  get asDisposable() {
    return Disposable.from(this);
  }

  get outputChannel() {
    return this.output;
  }

  dispose() {
    [
      this.output,
      this.command
    ].forEach(disposable => disposable.dispose());
  }

  run() {
    return window.withProgress({
      location: ProgressLocation.Notification,
      title: 'Computing uncovered code region locations',
      cancellable: false
    }, async progress => {
      const provider = DecorationLocationProvider.make({ progressReporter: progress });

      await provider.getDecorationLocationsForUncoveredCodeRegions('');
    });
  }

  private async runDecorationLocationsProvider() {
    this.reportStartInOutputChannel();

    await this.run();
  }

  private reportStartInOutputChannel() {
    this.output.show(false);
    this.output.clear();
    this.output.appendLine(`starting ${extensionDisplayName}`);
  }

  private readonly output: OutputChannel;
  private readonly command: Disposable;
}

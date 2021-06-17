import { commands, Disposable, OutputChannel, window } from 'vscode';
import { extensionId, extensionDisplayName } from '../../definitions';

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

  private runDecorationLocationsProvider() {
    this.output.show(false);
    this.output.clear();
    this.output.appendLine(`starting ${extensionDisplayName}`);
  }

  private readonly output: OutputChannel;
  private readonly command: Disposable;
}

import { extensionId, extensionDisplayName } from './definitions';
import * as DecorationLocationProvider from '../domain/decoration-locations-provider';
import * as SettingsProvider from '../modules/settings-provider/domain/settings-provider';

import { commands, Disposable, OutputChannel, ProgressLocation, window } from 'vscode';
import * as pc from '../adapters/process-control';
import * as fs from '../adapters/file-system';
import * as vscode from '../adapters/vscode';

export function make() {
  return new Cov();
}

class Cov {
  constructor() {
    this.output = window.createOutputChannel(extensionId);
    this.command = commands.registerCommand(`${extensionId}.reportUncoveredCodeRegionsInFile`, this.run, this);
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
      this.reportStartInOutputChannel();

      const settings = SettingsProvider.make({ workspace: vscode.workspace, errorChannel: this.output }).settings;

      const provider = DecorationLocationProvider.make({
        settings,
        vscode: {
          progressReporter: progress,
          errorChannel: this.output,
          workspace: vscode.workspace
        },
        processControl: {
          execFileForCommand: pc.execFile,
          execFileForTarget: pc.execFile
        },
        fileSystem: {
          createReadStream: fs.createReadStream,
          globSearch: fs.globSearch,
          mkdir: fs.mkdir,
          stat: fs.stat
        }
      });

      await provider.getDecorationLocationsForUncoveredCodeRegions('');
    });
  }

  private reportStartInOutputChannel() {
    this.output.show(false);
    this.output.clear();
    this.output.appendLine(`starting ${extensionDisplayName}`);
  }

  private readonly output: OutputChannel;
  private readonly command: Disposable;
}

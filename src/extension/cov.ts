// TODO: Global - Imports pattern
import { extensionId, extensionDisplayName } from './definitions';
import * as DecorationLocationProvider from '../modules/decoration-locations-provider/domain/decoration-locations-provider';
import * as SettingsProvider from '../modules/settings-provider/domain/settings-provider';
import * as BuildTreeDirectoryResolver from '../modules/build-tree-directory-resolver/domain/build-tree-directory-resolver';
import * as Cmake from '../modules/cmake/domain/cmake';

// TODO: only use adapters, not vscode directly
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
      const buildTreeDirectoryResolver = BuildTreeDirectoryResolver.make({ errorChannel: this.output, progressReporter: progress, settings, mkdir: fs.mkdir, stat: fs.stat });
      // TODO: Rework Cmake construction adapters
      const cmake = Cmake.make({
        settings,
        processControl: {
          execFileForCommand: pc.execFile,
          execFileForTarget: pc.execFile
        },
        vscode: {
          errorChannel: this.output,
          progressReporter: progress
        }
      });

      const provider = DecorationLocationProvider.make({
        settings,
        buildTreeDirectoryResolver,
        cmake,
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
          globSearch: fs.globSearch
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

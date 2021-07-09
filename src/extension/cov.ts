// TODO: put those in imports.ts
import { Uri, CancellationToken, ProviderResult } from 'vscode';
import * as Imports from './imports';

export function make() {
  return new Cov();
}

class Cov {
  constructor() {
    this.output = Imports.Adapters.Implementations.vscode.window.createOutputChannel(Imports.Extension.Definitions.extensionId);
    this.command = Imports.Adapters.Implementations.vscode.commands.registerCommand(`${Imports.Extension.Definitions.extensionId}.reportUncoveredCodeRegionsInFile`, this.run, this);
    this.textDocumentProvider = this.createUncoveredCodeRegionsDocumentProvider();
  }

  get asDisposable() {
    return Imports.Adapters.Implementations.vscode.Disposable.from(this);
  }

  get outputChannel() {
    return this.output;
  }

  dispose() {
    [
      this.output,
      this.command,
      this.textDocumentProvider
    ].forEach(disposable => disposable.dispose());
  }

  async run() {
    this.reportStartInOutputChannel();

  }

  get uncoveredCodeRegionsEditors(): ReadonlyArray<Imports.Adapters.Abstractions.vscode.TextEditor> {
    return [];
  }

  get uncoveredCodeRegionsDocumentProvider() {
    return this.textDocumentProvider;
  }

  private createUncoveredCodeRegionsDocumentProvider() {
    const provider = new class implements Imports.Adapters.Abstractions.vscode.TextDocumentContentProvider {
      provideTextDocumentContent(_uri: Uri, _token: CancellationToken): ProviderResult<string> {
        throw new Error('Method not implemented.');
      }
    };

    return Imports.Adapters.Implementations.vscode.workspace.registerTextDocumentContentProvider(Imports.Extension.Definitions.extensionId, provider);
  }

  private reportStartInOutputChannel() {
    this.output.show(false);
    this.output.clear();
    this.output.appendLine(`starting ${Imports.Extension.Definitions.extensionDisplayName}`);
  }

  private getCoverageInfoForFile(path: string) {
    return Imports.Adapters.Implementations.vscode.window.withProgress({
      location: Imports.Adapters.Implementations.vscode.ProgressLocation.Notification,
      title: 'Computing uncovered code region locations',
      cancellable: false
    }, async progressReporter => {

      const workspace = Imports.Adapters.Implementations.vscode.workspace;
      const errorChannel = this.output;

      const settings = Imports.Domain.Implementations.SettingsProvider.make({ workspace, errorChannel }).settings;
      const buildTreeDirectoryResolver = Imports.Domain.Implementations.BuildTreeDirectoryResolver.make({
        errorChannel,
        progressReporter,
        settings,
        mkdir: Imports.Adapters.Implementations.fileSystem.mkdir,
        stat: Imports.Adapters.Implementations.fileSystem.stat
      });
      const cmake = Imports.Domain.Implementations.Cmake.make({
        settings,
        execFile: Imports.Adapters.Implementations.processControl.execFile,
        errorChannel: this.output,
        progressReporter: progressReporter
      });
      const coverageInfoFileResolver = Imports.Domain.Implementations.CoverageInfoFileResolver.make({
        errorChannel,
        globSearch: Imports.Adapters.Implementations.fileSystem.globSearch,
        progressReporter,
        settings
      });
      const coverageInfoCollector = Imports.Domain.Implementations.CoverageInfoCollector.make({
        coverageInfoFileResolver,
        progressReporter,
        errorChannel,
        createReadStream: Imports.Adapters.Implementations.fileSystem.createReadStream
      });

      const provider = Imports.Domain.Implementations.DecorationLocationProvider.make({
        settings,
        buildTreeDirectoryResolver,
        cmake,
        coverageInfoCollector
      });

      return await provider.getDecorationLocationsForUncoveredCodeRegions(path);
    });
  }

  private readonly output: Imports.Adapters.Abstractions.vscode.OutputChannel;
  private readonly command: Imports.Adapters.Abstractions.vscode.DisposableLike;
  private readonly textDocumentProvider: Imports.Adapters.Abstractions.vscode.DisposableLike;
}

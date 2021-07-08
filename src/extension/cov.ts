import * as Imports from './imports';

export function make() {
  return new Cov();
}

class Cov {
  constructor() {
    this.output = Imports.Adapters.Implementations.vscode.window.createOutputChannel(Imports.Extension.Definitions.extensionId);
    this.command = Imports.Adapters.Implementations.vscode.commands.registerCommand(`${Imports.Extension.Definitions.extensionId}.reportUncoveredCodeRegionsInFile`, this.run, this);
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
      this.command
    ].forEach(disposable => disposable.dispose());
  }

  run() {
    return Imports.Adapters.Implementations.vscode.window.withProgress({
      location: Imports.Adapters.Implementations.vscode.ProgressLocation.Notification,
      title: 'Computing uncovered code region locations',
      cancellable: false
    }, async progressReporter => {
      this.reportStartInOutputChannel();

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

      await provider.getDecorationLocationsForUncoveredCodeRegions('');
    });
  }

  get uncoveredCodeRegionsEditors() {
    return [];
  }

  private reportStartInOutputChannel() {
    this.output.show(false);
    this.output.clear();
    this.output.appendLine(`starting ${Imports.Extension.Definitions.extensionDisplayName}`);
  }

  private readonly output: Imports.Adapters.Implementations.vscode.OutputChannel;
  private readonly command: Imports.Adapters.Implementations.vscode.Disposable;
}

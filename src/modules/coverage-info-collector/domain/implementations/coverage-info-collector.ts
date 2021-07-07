import * as Imports from '../../imports';

import { Readable } from 'stream';

export function make(adapters: Context): Imports.Domain.Abstractions.CoverageInfoCollector {
  return new CoverageInfoCollector(adapters);
}

export type LLVMCoverageInfoStreamBuilder = {
  createStream: (path: string) => Readable;
};

class CoverageInfoCollector implements Imports.Domain.Abstractions.CoverageInfoCollector {
  constructor(context: Context) {
    this.settings = context.settings;
    this.globSearch = context.globSearch;
    this.createReadStream = context.createReadStream;
    this.progressReporter = context.progressReporter;
    this.errorChannel = context.errorChannel;
  }

  async collectFor(sourceFilePath: string) {
    const coverageInfoFileResolver = Imports.Domain.Implementations.CoverageInfoFileResolver.make({
      settings: this.settings,
      globSearch: this.globSearch,
      progressReporter: this.progressReporter,
      errorChannel: this.errorChannel
    });

    const path = await coverageInfoFileResolver.resolveCoverageInfoFileFullPath();

    this.progressReporter.report({
      message: 'Prepared summary and uncovered region of code information.'
    });

    return Imports.Domain.Implementations.CoverageInfo.make(() => this.createReadStream(path), sourceFilePath, this.errorChannel);
  }

  private readonly settings: Imports.Domain.Abstractions.Settings;
  private readonly globSearch: Imports.Adapters.Abstractions.fileSystem.GlobSearchCallable;
  private readonly createReadStream: Imports.Adapters.Abstractions.fileSystem.CreateReadStreamCallable;
  private readonly progressReporter: Imports.Adapters.Abstractions.vscode.ProgressLike;
  private readonly errorChannel: Imports.Adapters.Abstractions.vscode.OutputChannelLike;
};

type Context = {
  settings: Imports.Domain.Abstractions.Settings,
  globSearch: Imports.Adapters.Abstractions.fileSystem.GlobSearchCallable,
  createReadStream: Imports.Adapters.Abstractions.fileSystem.CreateReadStreamCallable,
  progressReporter: Imports.Adapters.Abstractions.vscode.ProgressLike,
  errorChannel: Imports.Adapters.Abstractions.vscode.OutputChannelLike
};

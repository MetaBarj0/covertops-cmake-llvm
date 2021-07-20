import * as Imports from '../imports';

import { Readable } from 'stream';

export function make(adapters: Context): Imports.Domain.Abstractions.CoverageInfoCollector {
  return new CoverageInfoCollector(adapters);
}

export type LLVMCoverageInfoStreamBuilder = {
  createStream: (path: string) => Readable;
};

class CoverageInfoCollector implements Imports.Domain.Abstractions.CoverageInfoCollector {
  constructor(context: Context) {
    this.coverageInfoFileResolver = context.coverageInfoFileResolver;
    this.createReadStream = context.createReadStream;
    this.progressReporter = context.progressReporter;
    this.errorChannel = context.errorChannel;
  }

  async collectFor(sourceFilePath: string) {
    const path = await this.coverageInfoFileResolver.resolveCoverageInfoFileFullPath();

    this.progressReporter.report({
      message: 'Prepared summary and uncovered region of code information.'
    });

    // TODO - rename all occurences of error channel whatever their form to respective output channel form
    return Imports.Domain.Implementations.CoverageInfo.make(() => this.createReadStream(path), sourceFilePath, this.errorChannel);
  }

  private readonly coverageInfoFileResolver: Imports.Domain.Abstractions.CoverageInfoFileResolver;
  private readonly createReadStream: Imports.Adapters.Abstractions.fileSystem.CreateReadStreamCallable;
  private readonly progressReporter: Imports.Adapters.Abstractions.vscode.ProgressLike;
  private readonly errorChannel: Imports.Adapters.Abstractions.vscode.OutputChannelLike;
};

type Context = {
  createReadStream: Imports.Adapters.Abstractions.fileSystem.CreateReadStreamCallable,
  progressReporter: Imports.Adapters.Abstractions.vscode.ProgressLike,
  errorChannel: Imports.Adapters.Abstractions.vscode.OutputChannelLike,
  coverageInfoFileResolver: Imports.Domain.Abstractions.CoverageInfoFileResolver;
};

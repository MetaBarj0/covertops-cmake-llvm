import * as Imports from "./imports";

import * as CoverageInfo from "./coverage-info";

import { Readable } from "stream";

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
    this.outputChannel = context.outputChannel;
  }

  async collectFor(sourceFilePath: string) {
    const path = await this.coverageInfoFileResolver.resolveCoverageInfoFileFullPath();

    this.progressReporter.report({
      message: "Prepared summary and uncovered region of code information."
    });

    return CoverageInfo.make(() => this.createReadStream(path), sourceFilePath, this.outputChannel);
  }

  private readonly coverageInfoFileResolver: Imports.Domain.Abstractions.CoverageInfoFileResolver;
  private readonly createReadStream: Imports.Adapters.Abstractions.fileSystem.CreateReadStreamCallable;
  private readonly progressReporter: Imports.Adapters.Abstractions.vscode.ProgressLike;
  private readonly outputChannel: Imports.Adapters.Abstractions.vscode.OutputChannelLike;
}

type Context = {
  createReadStream: Imports.Adapters.Abstractions.fileSystem.CreateReadStreamCallable,
  progressReporter: Imports.Adapters.Abstractions.vscode.ProgressLike,
  outputChannel: Imports.Adapters.Abstractions.vscode.OutputChannelLike,
  coverageInfoFileResolver: Imports.Domain.Abstractions.CoverageInfoFileResolver;
};

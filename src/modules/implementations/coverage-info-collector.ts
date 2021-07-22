import * as Types from "./types";

import * as CoverageInfo from "./coverage-info";

import { Readable } from "stream";

export function make(adapters: Context): Types.Modules.Abstractions.CoverageInfoCollector {
  return new CoverageInfoCollector(adapters);
}

export type LLVMCoverageInfoStreamBuilder = {
  createStream: (path: string) => Readable;
};

class CoverageInfoCollector implements Types.Modules.Abstractions.CoverageInfoCollector {
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

  private readonly coverageInfoFileResolver: Types.Modules.Abstractions.CoverageInfoFileResolver;
  private readonly createReadStream: Types.Adapters.Abstractions.fileSystem.CreateReadStreamCallable;
  private readonly progressReporter: Types.Adapters.Abstractions.vscode.ProgressLike;
  private readonly outputChannel: Types.Adapters.Abstractions.vscode.OutputChannelLike;
}

type Context = {
  createReadStream: Types.Adapters.Abstractions.fileSystem.CreateReadStreamCallable,
  progressReporter: Types.Adapters.Abstractions.vscode.ProgressLike,
  outputChannel: Types.Adapters.Abstractions.vscode.OutputChannelLike,
  coverageInfoFileResolver: Types.Modules.Abstractions.CoverageInfoFileResolver;
};

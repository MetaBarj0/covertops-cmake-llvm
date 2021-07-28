import * as Types from "./types";

import * as CoverageInfo from "./coverage-info";

import * as Strings from "../../extension/implementations/strings";

import { Readable } from "stream";

export function make(adapters: Context): Types.Modules.CoverageInfoCollector {
  return new CoverageInfoCollector(adapters);
}

export type LLVMCoverageInfoStreamBuilder = {
  createStream: (path: string) => Readable;
};

class CoverageInfoCollector implements Types.Modules.CoverageInfoCollector {
  constructor(context: Context) {
    this.coverageInfoFileResolver = context.coverageInfoFileResolver;
    this.createReadStream = context.createReadStream;
    this.progressReporter = context.progressReporter;
    this.outputChannel = context.outputChannel;
  }

  async collectFor(sourceFilePath: string) {
    const path = await this.coverageInfoFileResolver.resolveCoverageInfoFileFullPath();

    this.progressReporter.report({
      // TODO(wip): refacto magic strings
      message: Strings.progressCoverageInfoReady
    });

    return CoverageInfo.make(() => this.createReadStream(path), sourceFilePath, this.outputChannel);
  }

  private readonly coverageInfoFileResolver: Types.Modules.CoverageInfoFileResolver;
  private readonly createReadStream: Types.Adapters.fileSystem.CreateReadStreamCallable;
  private readonly progressReporter: Types.Adapters.vscode.ProgressLike;
  private readonly outputChannel: Types.Adapters.vscode.OutputChannelLike;
}

type Context = {
  createReadStream: Types.Adapters.fileSystem.CreateReadStreamCallable,
  progressReporter: Types.Adapters.vscode.ProgressLike,
  outputChannel: Types.Adapters.vscode.OutputChannelLike,
  coverageInfoFileResolver: Types.Modules.CoverageInfoFileResolver;
};

import * as Types from "../../../types";

import * as CoverageInfo from "./coverage-info";

import * as Strings from "../../../strings";

import { Readable } from "stream";

export function make(adapters: Context): Types.Modules.CoverageInfoCollector.CoverageInfoCollector {
  return new CoverageInfoCollector(adapters);
}

export type LLVMCoverageInfoStreamBuilder = {
  createStream: (path: string) => Readable;
};

class CoverageInfoCollector implements Types.Modules.CoverageInfoCollector.CoverageInfoCollector {
  constructor(context: Context) {
    this.coverageInfoFileResolver = context.coverageInfoFileResolver;
    this.createReadStream = context.createReadStream;
    this.progressReporter = context.progressReporter;
    this.outputChannel = context.outputChannel;
  }

  async collectFor(sourceFilePath: string) {
    const path = await this.coverageInfoFileResolver.resolveCoverageInfoFileFullPath();

    this.progressReporter.report({
      message: Strings.progressCoverageInfoReady
    });

    return CoverageInfo.make(() => this.createReadStream(path), sourceFilePath, this.outputChannel);
  }

  private readonly coverageInfoFileResolver: Types.Modules.CoverageInfoFileResolver.CoverageInfoFileResolver;
  private readonly createReadStream: Types.Adapters.Node.CreateReadStreamCallable;
  private readonly progressReporter: Types.Adapters.Vscode.ProgressLike;
  private readonly outputChannel: Types.Adapters.Vscode.OutputChannelLike;
}

type Context = {
  createReadStream: Types.Adapters.Node.CreateReadStreamCallable,
  progressReporter: Types.Adapters.Vscode.ProgressLike,
  outputChannel: Types.Adapters.Vscode.OutputChannelLike,
  coverageInfoFileResolver: Types.Modules.CoverageInfoFileResolver.CoverageInfoFileResolver;
};

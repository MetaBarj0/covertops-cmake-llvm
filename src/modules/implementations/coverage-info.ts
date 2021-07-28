import * as Types from "./types";

import * as RegionCoverageInfo from "./region-coverage-info";
import { CoverageSummary } from "./coverage-summary";

import * as Strings from "../../strings";

import { Readable } from "stream";
import { chain } from "stream-chain";
import { parser } from "stream-json";
import { pick } from "stream-json/filters/Pick";
import { streamArray } from "stream-json/streamers/StreamArray";

export function make(llvmCoverageInfoStreamFactory: StreamFactory,
  sourceFilePath: string,
  outputChannel: Types.Adapters.vscode.OutputChannelLike): Types.Modules.CoverageInfo {
  return new CoverageInfo(llvmCoverageInfoStreamFactory, sourceFilePath, outputChannel);
}

class CoverageInfo implements Types.Modules.CoverageInfo {
  constructor(llvmCoverageInfoStreamFactory: StreamFactory,
    sourceFilePath: string,
    outputChannel: Types.Adapters.vscode.OutputChannelLike) {
    this.llvmCoverageInfoStreamFactory = llvmCoverageInfoStreamFactory;
    this.sourceFilePath = this.fixPathForLlvmCoverageInfoFile(sourceFilePath);
    this.outputChannel = outputChannel;
  }

  get summary() {
    const pipeline = this.preparePipelineForSummary();

    return new Promise<Types.Modules.CoverageSummary>((resolve, reject) => {
      let s: RawLLVMCoverageSummary;

      pipeline.
        once("data", chunk => { s = <RawLLVMCoverageSummary>chunk.summary.regions; }).
        once("end", () => {
          if (s)
            return resolve(new CoverageSummary(s.count, s.covered, s.notcovered, s.percent));

          const errorMessage = Strings.errorNoSummaryCoverageInfoFor(this.sourceFilePath);

          this.outputChannel.appendLine(errorMessage);

          reject(new Error(errorMessage));
        }).
        once("error", err => {
          const errorMessage = `${Strings.errorInvalidCoverageInfoFileContent}${err.message}`;

          this.outputChannel.appendLine(errorMessage);

          reject(new Error(errorMessage));
        });
    });
  }

  get uncoveredRegions() {
    return this.uncoveredRegions_();
  }

  private fixPathForLlvmCoverageInfoFile(sourceFilePath: string) {
    return `${sourceFilePath[0].toUpperCase()}${sourceFilePath.slice(1)}`;
  }

  private async * uncoveredRegions_() {
    for await (const rawRegionCoverageInfo of this.allRawRegionsCoverageInfo()) {
      const regionCoverageInfo = RegionCoverageInfo.make(<Types.Modules.RawLLVMRegionCoverageInfo>rawRegionCoverageInfo);

      if (regionCoverageInfo.isAnUncoveredRegion)
        yield regionCoverageInfo;
    }
  }

  private allRawRegionsCoverageInfo() {
    const pipeline = this.preparePipelineForRegionCoverageInfo();

    return new RegionCoverageInfoAsyncIterable(pipeline, this.sourceFilePath, this.outputChannel);
  }

  private preparePipelineForRegionCoverageInfo() {
    const self = this;

    return this.extendBasicPipelineWith(function* (dataItem) {
      if (dataItem.key !== 0)
        return null;

      const functions = dataItem.value.functions;

      const functionsForSourceFilePath = functions.filter((f: { filenames: ReadonlyArray<string> }) => f.filenames[0] === self.sourceFilePath);

      const regionsForSourceFilePath =
        functionsForSourceFilePath.map((fn: Types.Modules.RawLLVMFunctionCoverageInfo) =>
          <Types.Modules.RawLLVMRegionsCoverageInfo>fn.regions);

      for (const region of regionsForSourceFilePath)
        yield region;

      return null;
    });
  }

  private preparePipelineForSummary() {
    return this.extendBasicPipelineWith(dataItem => {
      if (dataItem.key !== 0)
        return null;

      const files = dataItem.value.files;

      return files.find((file: Types.Modules.RawLLVMFileCoverageInfo) => file.filename === this.sourceFilePath);
    });
  }

  private extendBasicPipelineWith<T>(fn: (dataItem: Types.Modules.RawLLVMStreamedDataItemCoverageInfo) => T) {
    return chain([
      this.llvmCoverageInfoStreamFactory(),
      parser({ streamValues: true }),
      pick({ filter: "data" }),
      streamArray(),
      fn
    ]);
  }

  private readonly llvmCoverageInfoStreamFactory: StreamFactory;
  private readonly sourceFilePath: string;
  private readonly outputChannel: Types.Adapters.vscode.OutputChannelLike;
}

type StreamFactory = () => Readable;

class RawLLVMCoverageSummary {
  constructor(other: RawLLVMCoverageSummary) {
    this.count = other.count;
    this.covered = other.covered;
    this.notcovered = other.notcovered;
    this.percent = other.percent;
  }

  readonly count: number;
  readonly covered: number;
  readonly notcovered: number;
  readonly percent: number;
}

class RegionCoverageInfoAsyncIterable {
  constructor(pipeline: Readable, sourceFilePath: string, outputChannel: Types.Adapters.vscode.OutputChannelLike) {
    this.iterator = new RegionCoverageInfoAsyncIterator(pipeline, sourceFilePath, outputChannel);
  }

  [Symbol.asyncIterator]() {
    return this.iterator;
  }

  private readonly iterator: RegionCoverageInfoAsyncIterator;
}

class RegionCoverageInfoAsyncIterator {
  constructor(pipeline: Readable, sourceFilePath: string, outputChannel: Types.Adapters.vscode.OutputChannelLike) {
    this.pipeline = pipeline;
    this.sourceFilePath = sourceFilePath;
    this.outputChannel = outputChannel;
  }

  async next() {
    await this.ensureInputReadableStreamIsValid();

    const regionCoverageInfo = <Types.Modules.RawLLVMRegionCoverageInfo>this.pipeline.read(1);

    if (regionCoverageInfo === null)
      return this.terminateIteration();

    this.hasAtLeastOneElement = true;

    return new RegionCoverageInfoIterator({ done: false, value: regionCoverageInfo });
  }

  private async ensureInputReadableStreamIsValid() {
    await new Promise<void>((resolve, reject) => {
      this.pipeline.
        once("readable", () => { resolve(); }).
        once("end", () => { resolve(); }).
        once("error", err => {
          const errorMessage = `${Strings.errorInvalidCoverageInfoFileContent}${err.message}`;

          this.outputChannel.appendLine(errorMessage);

          reject(new Error(errorMessage));
        });
    });
  }

  private terminateIteration() {
    if (!this.hasAtLeastOneElement)
      this.outputChannel.appendLine(Strings.reportNoUncoveredCodeRegionsInfoFor(this.sourceFilePath));

    return new RegionCoverageInfoIterator({ done: true });
  }

  private readonly pipeline: Readable;
  private readonly sourceFilePath: string;
  private hasAtLeastOneElement = false;
  private readonly outputChannel: Types.Adapters.vscode.OutputChannelLike;
}

class RegionCoverageInfoIterator {
  constructor(other: RegionCoverageInfoIterator) {
    this.done = other.done;
    this.value = other.value;
  }

  readonly done: boolean;
  readonly value?: Types.Modules.RawLLVMRegionCoverageInfo;
}

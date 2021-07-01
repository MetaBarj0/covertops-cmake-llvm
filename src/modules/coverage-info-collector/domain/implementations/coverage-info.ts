import { OutputChannelLike } from '../../../../shared-kernel/abstractions/vscode';

import { CoverageSummary } from './coverage-summary';
import {
  RawLLVMStreamedDataItemCoverageInfo,
  RawLLVMFileCoverageInfo,
  RawLLVMFunctionCoverageInfo,
  RawLLVMRegionCoverageInfo,
  RawLLVMRegionsCoverageInfo
} from '../../domain/abstractions/region-coverage-info';

import * as Abstractions from '../../domain/abstractions/coverage-info';

import * as Definitions from '../../../../extension/definitions';
import * as RegionCoverageInfo from './region-coverage-info';

import { Readable } from 'stream';
import { chain } from 'stream-chain';
import { parser } from 'stream-json';
import { pick } from 'stream-json/filters/Pick';
import { streamArray } from 'stream-json/streamers/StreamArray';

export function make(llvmCoverageInfoStreamFactory: StreamFactory, sourceFilePath: string, errorChannel: OutputChannelLike): Abstractions.CoverageInfo {
  return new CoverageInfo(llvmCoverageInfoStreamFactory, sourceFilePath, errorChannel);
}

class CoverageInfo implements Abstractions.CoverageInfo {
  constructor(llvmCoverageInfoStreamFactory: StreamFactory, sourceFilePath: string, errorChannel: OutputChannelLike) {
    this.llvmCoverageInfoStreamFactory = llvmCoverageInfoStreamFactory;
    this.sourceFilePath = sourceFilePath;
    this.errorChannel = errorChannel;
  }

  get summary() {
    const pipeline = this.preparePipelineForSummary();

    return new Promise<CoverageSummary>((resolve, reject) => {
      let s: RawLLVMCoverageSummary;

      pipeline
        .once('data', chunk => { s = <RawLLVMCoverageSummary>chunk.summary.regions; })
        .once('end', () => {
          if (s)
            return resolve(new CoverageSummary(s.count, s.covered, s.notcovered, s.percent));

          const errorMessage = 'Cannot find any summary coverage info for the file ' +
            `${this.sourceFilePath}. Ensure this source file is covered by a test in your project.`;

          this.errorChannel.appendLine(errorMessage);

          reject(new Error(errorMessage));
        })
        .once('error', err => {
          // TODO: refacto string
          const errorMessage = CoverageInfo.invalidInputReadableStreamMessage + err.message;

          this.errorChannel.appendLine(errorMessage);
          reject(new Error(errorMessage));
        });
    });
  };

  get uncoveredRegions() {
    return this._uncoveredRegions();
  }

  private async *_uncoveredRegions() {
    for await (const rawRegionCoverageInfo of this.allRawRegionsCoverageInfoIn()) {
      const regionCoverageInfo = RegionCoverageInfo.make(<RawLLVMRegionCoverageInfo>rawRegionCoverageInfo);

      if (regionCoverageInfo.isAnUncoveredRegion)
        yield regionCoverageInfo;
    }
  }

  private allRawRegionsCoverageInfoIn() {
    const pipeline = this.preparePipelineForRegionCoverageInfo();

    return new RegionCoverageInfoAsyncIterable(pipeline, this.sourceFilePath, this.errorChannel);
  }

  private preparePipelineForRegionCoverageInfo() {
    const self = this;

    return this.extendBasicPipelineWith(function* (dataItem) {
      if (dataItem.key !== 0)
        return null;

      const functions = dataItem.value.functions;

      const functionsForSourceFilePath = functions.filter((f: { filenames: ReadonlyArray<string> }) => f.filenames[0] === self.sourceFilePath);

      const regionsForSourceFilePath =
        functionsForSourceFilePath.map((fn: RawLLVMFunctionCoverageInfo) => <RawLLVMRegionsCoverageInfo>fn.regions);

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

      return files.find((file: RawLLVMFileCoverageInfo) => file.filename === this.sourceFilePath);
    });
  }

  private extendBasicPipelineWith<T>(fn: (dataItem: RawLLVMStreamedDataItemCoverageInfo) => T) {
    return chain([
      this.llvmCoverageInfoStreamFactory(),
      parser({ streamValues: true }),
      pick({ filter: 'data' }),
      streamArray(),
      fn
    ]);
  }

  private readonly llvmCoverageInfoStreamFactory: StreamFactory;
  private readonly sourceFilePath: string;
  private readonly errorChannel: OutputChannelLike;

  static get invalidInputReadableStreamMessage() {
    return 'Invalid coverage information file have been found in the build tree directory. ' +
      'Coverage information file must contain llvm coverage report in json format. ' +
      'Ensure that both ' +
      `'${Definitions.extensionNameInSettings}: Build Tree Directory' and ` +
      `'${Definitions.extensionNameInSettings}: Coverage Info File Name' ` +
      'settings are correctly set.';
  };
};

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
};

class RegionCoverageInfoAsyncIterable {
  constructor(pipeline: Readable, sourceFilePath: string, errorChannel: OutputChannelLike) {
    this.iterator = new RegionCoverageInfoAsyncIteratorContract(pipeline, sourceFilePath, errorChannel);
  }

  [Symbol.asyncIterator]() {
    return this.iterator;
  }

  private readonly iterator: RegionCoverageInfoAsyncIteratorContract;
};

class RegionCoverageInfoAsyncIteratorContract {
  constructor(pipeline: Readable, sourceFilePath: string, errorChannel: OutputChannelLike) {
    this.pipeline = pipeline;
    this.sourceFilePath = sourceFilePath;
    this.errorChannel = errorChannel;
  }

  async next() {
    await this.ensureInputReadableStreaIsValid();

    const regionCoverageInfo = <RawLLVMRegionCoverageInfo>this.pipeline.read(1);

    if (regionCoverageInfo === null)
      return this.terminateIteration();

    this.last = regionCoverageInfo;

    return new RegionCoverageInfoIterator({ done: false, value: regionCoverageInfo });
  }

  private async ensureInputReadableStreaIsValid() {
    await new Promise<void>((resolve, reject) => {
      this.pipeline
        .once('readable', () => { resolve(); })
        .once('end', () => { resolve(); })
        .once('error', err => {
          const errorMessage = CoverageInfo.invalidInputReadableStreamMessage + err.message;

          this.errorChannel.appendLine(errorMessage);

          reject(new Error(errorMessage));
        });
    });
  }

  private terminateIteration() {
    if (this.last)
      return new RegionCoverageInfoIterator({ done: true });

    const errorMessage = 'Cannot find any uncovered code regions for the file ' +
      `${this.sourceFilePath}. Ensure this source file is covered by a test in your project.`;

    this.errorChannel.appendLine(errorMessage);

    throw new Error(errorMessage);
  }

  private readonly pipeline: Readable;
  private readonly sourceFilePath: string;
  private last: RawLLVMRegionCoverageInfo | undefined = undefined;
  private readonly errorChannel: OutputChannelLike;
};

class RegionCoverageInfoIterator {
  constructor(other: RegionCoverageInfoIterator) {
    this.done = other.done;
    this.value = other.value;
  }

  readonly done: boolean;
  readonly value?: RawLLVMRegionCoverageInfo;
};
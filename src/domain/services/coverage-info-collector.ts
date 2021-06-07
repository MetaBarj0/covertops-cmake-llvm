import * as definitions from '../../definitions';
import { CoverageSummary } from '../value-objects/coverage-summary';
import { RawLLVMRegionCoverageInfo, RegionCoverageInfo } from '../value-objects/region-coverage-info';

import { Readable } from 'stream';
import { chain } from 'stream-chain';
import { parser } from 'stream-json';
import { pick } from 'stream-json/filters/Pick';
import { streamArray } from 'stream-json/streamers/StreamArray';

export type LLVMCoverageInfoStreamBuilder = {
  makeLLVMCoverageInfoStream(): Readable;
};

export class CoverageCollector {
  constructor(llvmCoverageInfoStreamBuilder: LLVMCoverageInfoStreamBuilder) {
    this.llvmCoverageInfoStreamBuilder = llvmCoverageInfoStreamBuilder;
  }

  collectFor(sourceFilePath: string): CoverageInfo {
    return new CoverageInfo(this.llvmCoverageInfoStreamBuilder.makeLLVMCoverageInfoStream(), sourceFilePath);
  }

  static readonly invalidInputReadableStreamMessage =
    'Invalid coverage information file have been found in the build tree directory. ' +
    'Coverage information file must contain llvm coverage report in json format. ' +
    'Ensure that both ' +
    `'${definitions.extensionNameInSettings}: Build Tree Directory' and ` +
    `'${definitions.extensionNameInSettings}: Coverage Info File Name' ` +
    'settings are correctly set.';

  private readonly llvmCoverageInfoStreamBuilder: LLVMCoverageInfoStreamBuilder;
};

class CoverageInfo {
  constructor(stream: Readable, sourceFilePath: string) {
    this.stream = stream;
    this.sourceFilePath = sourceFilePath;
  }

  get summary() {
    const pipeline = this.preparePipelineForSummary();

    return new Promise<CoverageSummary>((resolve, reject) => {
      let s: RawLLVMCoverageSummary;

      pipeline
        .once('data', chunk => { s = <RawLLVMCoverageSummary>chunk.summary.regions; })
        .once('end', () => {
          if (s)
            resolve(new CoverageSummary(s.count, s.covered, s.notcovered, s.percent));
          else
            reject(new Error('Cannot find any summary coverage info for the file ' +
              `${this.sourceFilePath}. Ensure this source file is covered by a test in your project.`));
        })
        .once('error', err => {
          reject(new Error(CoverageCollector.invalidInputReadableStreamMessage + err.message));
        });
    });
  };

  async *uncoveredRegions() {
    for await (const rawRegionCoverageInfo of this.allRawRegionsCoverageInfoIn()) {
      const regionCoverageInfo = new RegionCoverageInfo(<RawLLVMRegionCoverageInfo>rawRegionCoverageInfo);

      if (regionCoverageInfo.isAnUncoveredRegion)
        yield regionCoverageInfo;
    }
  }

  private allRawRegionsCoverageInfoIn() {
    const pipeline = this.preparePipelineForRegionCoverageInfo();

    return new RegionCoverageInfoAsyncIterable(pipeline, this.sourceFilePath);
  }

  private preparePipelineForRegionCoverageInfo() {
    return this.extendBasicPipelineWith(dataItem => {
      if (dataItem.key !== 0)
        return null;

      const functions = dataItem.value.functions;

      const fn = functions.find((f: { filenames: ReadonlyArray<string> }) => f.filenames[0] === this.sourceFilePath);

      return fn?.regions;
    });
  }

  private preparePipelineForSummary() {
    return this.extendBasicPipelineWith(dataItem => {
      if (dataItem.key !== 0)
        return null;

      const files = dataItem.value.files;

      return files.find((file: any) => file.filename === this.sourceFilePath);
    });
  }

  private extendBasicPipelineWith(fn: (dataItem: any) => any) {
    return chain([
      this.stream,
      parser({ streamValues: true }),
      pick({ filter: 'data' }),
      streamArray(),
      fn
    ]);
  }

  private readonly stream: Readable;
  private readonly sourceFilePath: string;
};

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

class RegionCoverageInfoIterator {
  constructor(other: RegionCoverageInfoIterator) {
    this.done = other.done;
    this.value = other.value;
  }

  readonly done: boolean;
  readonly value?: RawLLVMRegionCoverageInfo;
};

class RegionCoverageInfoAsyncIteratorContract {
  constructor(pipeline: Readable, sourceFilePath: string) {
    this.pipeline = pipeline;
    this.sourceFilePath = sourceFilePath;
  }

  async next() {
    await new Promise<void>((resolve, reject) => {
      this.pipeline
        .once('readable', () => { resolve(); })
        .once('end', () => { resolve(); })
        .once('error', err => {
          reject(new Error(CoverageCollector.invalidInputReadableStreamMessage + err.message));
        });
    });

    const regionCoverageInfo = <RawLLVMRegionCoverageInfo>this.pipeline.read(1);

    if (regionCoverageInfo === null)
      if (this.last)
        return new RegionCoverageInfoIterator({ done: true });
      else
        throw (new Error('Cannot find any uncovered code regions for the file ' +
          `${this.sourceFilePath}. Ensure this source file is covered by a test in your project.`));

    this.last = regionCoverageInfo;

    return new RegionCoverageInfoIterator({ done: false, value: regionCoverageInfo });
  }

  private readonly pipeline: Readable;
  private readonly sourceFilePath: string;
  private last: RawLLVMRegionCoverageInfo | undefined = undefined;
};

class RegionCoverageInfoAsyncIterable {
  constructor(pipeline: Readable, sourceFilePath: string) {
    this.iterator = new RegionCoverageInfoAsyncIteratorContract(pipeline, sourceFilePath);
  }

  [Symbol.asyncIterator]() {
    return this.iterator;
  }

  private readonly iterator: RegionCoverageInfoAsyncIteratorContract;
};

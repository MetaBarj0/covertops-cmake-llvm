import * as definitions from '../../../definitions';
import * as SettingsProvider from './settings-provider';
import * as CoverageInfoFileResolver from './coverage-info-file-resolver';
import * as ProgressReporter from './progress-reporter';
import { CoverageSummary } from '../../value-objects/coverage-summary';

import {
  RawLLVMStreamedDataItemCoverageInfo,
  RawLLVMFileCoverageInfo,
  RawLLVMFunctionCoverageInfo,
  RawLLVMRegionCoverageInfo,
  RawLLVMRegionsCoverageInfo,
  RegionCoverageInfo
} from '../../value-objects/region-coverage-info';

import { Readable } from 'stream';
import { chain } from 'stream-chain';
import { parser } from 'stream-json';
import { pick } from 'stream-json/filters/Pick';
import { streamArray } from 'stream-json/streamers/StreamArray';

export function make(adapters: Adapters) {
  return new CoverageInfoCollector(adapters);
}

export type LLVMCoverageInfoStreamBuilder = {
  createStream: (path: string) => Readable;
};

class CoverageInfoCollector {
  constructor(adapters: Adapters) {
    this.workspace = adapters.workspace;
    this.globSearch = adapters.globSearch;
    this.llvmCoverageInfoStreamBuilder = adapters.llvmCoverageInfoStreamBuilder;
    this.progressReporter = adapters.progressReporter;
  }

  async collectFor(sourceFilePath: string) {
    const coverageInfoFileResolver = CoverageInfoFileResolver.make({
      workspace: this.workspace,
      globSearch: this.globSearch,
      progressReporter: this.progressReporter
    });

    const path = await coverageInfoFileResolver.resolveCoverageInfoFileFullPath();

    this.progressReporter.report({
      message: 'Prepared summary and uncovered region of code information.',
      increment: 100 / 6 * 6
    });

    return new CoverageInfo(() => this.llvmCoverageInfoStreamBuilder.createStream(path), sourceFilePath);
  }

  static readonly invalidInputReadableStreamMessage =
    'Invalid coverage information file have been found in the build tree directory. ' +
    'Coverage information file must contain llvm coverage report in json format. ' +
    'Ensure that both ' +
    `'${definitions.extensionNameInSettings}: Build Tree Directory' and ` +
    `'${definitions.extensionNameInSettings}: Coverage Info File Name' ` +
    'settings are correctly set.';

  private readonly workspace: SettingsProvider.VscodeWorkspaceLike;
  private readonly globSearch: CoverageInfoFileResolver.GlobSearchLike;
  private readonly llvmCoverageInfoStreamBuilder: LLVMCoverageInfoStreamBuilder;
  private readonly progressReporter: ProgressReporter.ProgressLike;
};

type Adapters = {
  workspace: SettingsProvider.VscodeWorkspaceLike,
  globSearch: CoverageInfoFileResolver.GlobSearchLike,
  llvmCoverageInfoStreamBuilder: LLVMCoverageInfoStreamBuilder,
  progressReporter: ProgressReporter.ProgressLike
};

type StreamFactory = () => Readable;

class CoverageInfo {
  constructor(llvmCoverageInfoStreamFactory: StreamFactory, sourceFilePath: string) {
    this.llvmCoverageInfoStreamFactory = llvmCoverageInfoStreamFactory;
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
          reject(new Error(CoverageInfoCollector.invalidInputReadableStreamMessage + err.message));
        });
    });
  };

  get uncoveredRegions() {
    return this._uncoveredRegions();
  }

  private async *_uncoveredRegions() {
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
          reject(new Error(CoverageInfoCollector.invalidInputReadableStreamMessage + err.message));
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

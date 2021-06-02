import { extensionName } from '../../extension-name';

import { Readable } from 'stream';
import { chain } from 'stream-chain';
import { parser } from 'stream-json';
import { pick } from 'stream-json/filters/Pick';
import { streamArray } from 'stream-json/streamers/StreamArray';

export type LLVMCoverageInfoStreamBuilder = {
  makeLLVMCoverageInfoStream(): Readable;
};

export type Summary = {
  count: number;
  covered: number;
  notCovered: number;
  percent: number;
};

type UncoveredRegions = [number, number, number, number, number, number, number, number];

type UncoveredRegionsIterator = {
  done: boolean,
  value?: UncoveredRegions
};

type UncoveredRegionsAsyncIterator = {
  [Symbol.asyncIterator](): {
    next(): Promise<UncoveredRegionsIterator>;
  }
};

export type CoverageInfo = {
  summary(): Promise<Summary>,
  uncoveredRegions(): UncoveredRegionsAsyncIterator
};

export class CoverageCollector {
  constructor(llvmCoverageInfoStreamBuilder: LLVMCoverageInfoStreamBuilder) {
    this.llvmCoverageInfoStreamBuilder = llvmCoverageInfoStreamBuilder;
  }

  // TODO: refacto anonymous class implements...
  collectFor(sourceFilePath: string): CoverageInfo {
    return {
      summary: () => this.coverageSummaryFor(sourceFilePath),
      uncoveredRegions: () => this.uncoveredRegionsFor(sourceFilePath)
    };
  }

  private coverageSummaryFor(sourceFilePath: string) {
    const pipeline = chain([
      this.llvmCoverageInfoStreamBuilder.makeLLVMCoverageInfoStream(),
      parser({ streamValues: true }),
      pick({ filter: 'data' }),
      streamArray(),
      dataItem => {
        if (dataItem.key !== 0)
          return null;

        const files = dataItem.value.files;

        if (!files.filter((file: any) => file.filename === sourceFilePath))
          return null;

        return files;
      }
    ]);

    return new Promise<Summary>((resolve, reject) => {
      pipeline.once('data', chunk => {
        const s = chunk.summary.regions;

        resolve({
          count: s.count,
          covered: s.covered,
          notCovered: s.notcovered,
          percent: s.percent
        });
      })
        .once('error', err => {
          reject(new Error('Invalid coverage information file have been found in the build tree directory. ' +
            'Coverage information file must contain llvm coverage report in json format. ' +
            'Ensure that both ' +
            `'${extensionName}: Build Tree Directory' and '${extensionName}: Coverage Info File Name' ` +
            'settings are correctly set.' + err.message));
        });
    });
  }

  private uncoveredRegionsFor(sourceFilePath: string): UncoveredRegionsAsyncIterator {
    const pipeline = chain([
      this.llvmCoverageInfoStreamBuilder.makeLLVMCoverageInfoStream(),
      parser({ streamValues: true }),
      pick({ filter: 'data' }),
      streamArray(),
      dataItem => {
        if (dataItem.key !== 0)
          return null;

        const functions = dataItem.value.functions;

        const fn = functions.find((f: { filenames: ReadonlyArray<string> }) => f.filenames[0] === sourceFilePath);

        return fn?.regions;
      }
    ]);

    return {
      [Symbol.asyncIterator]() {
        return {
          async next(): Promise<UncoveredRegionsIterator> {
            await new Promise<void>((resolve, reject) => {
              pipeline
                .once('readable', () => { resolve(); })
                .once('end', () => { resolve(); })
                .once('error', err => {
                  reject(new Error('Invalid coverage information file have been found in the build tree directory. ' +
                    'Coverage information file must contain llvm coverage report in json format. ' +
                    'Ensure that both ' +
                    `'${extensionName}: Build Tree Directory' and '${extensionName}: Coverage Info File Name' ` +
                    'settings are correctly set.' + err.message));
                });
            });

            const uncoveredRegion = <UncoveredRegions>pipeline.read(1);

            if (uncoveredRegion === null)
              return new Promise<UncoveredRegionsIterator>(resolve => { resolve({ done: true }); });

            return new Promise<UncoveredRegionsIterator>(resolve => { resolve({ done: false, value: uncoveredRegion }); });
          }
        };
      }
    };
  }

  private readonly llvmCoverageInfoStreamBuilder: LLVMCoverageInfoStreamBuilder;
};
import { extensionName } from '../../extension-name';

import { Readable } from 'stream';
import { CoverageDecorations } from '../value-objects/coverage-decorations';

import { chain } from 'stream-chain';
import { parser } from 'stream-json';
import { pick } from 'stream-json/filters/Pick';
import { streamArray } from 'stream-json/streamers/StreamArray';

export type StreamBuilder = {
  createReadStreamFromPath(path: string): Readable;
};

export class UncoveredCodeRegionsCollector {
  constructor(streamBuilder: StreamBuilder) {
    this.streamBuilder = streamBuilder;
  }

  collectUncoveredCodeRegions(sourceFilePath: string) {
    return new Promise<CoverageDecorations>((resolve, reject) => {
      const pipeline = chain([
        this.streamBuilder.createReadStreamFromPath(sourceFilePath),
        parser(),
        pick({ filter: 'data' }),
        streamArray()
      ]);

      pipeline.on('error', error => {
        reject(
          'Invalid coverage information file have been found in the build tree directory. ' +
          'Coverage information file must contain llvm coverage report in json format. ' +
          'Ensure that both ' +
          `'${extensionName}: Build Tree Directory' and '${extensionName}: Coverage Info File Name' ` +
          'settings are correctly set.' +
          `\n${error.message}`);
      });

      pipeline.on('data', () => {
        resolve(new CoverageDecorations({
          file: sourceFilePath,
          locations: []
        }));
      });
    });
  }

  private readonly streamBuilder: StreamBuilder;
};
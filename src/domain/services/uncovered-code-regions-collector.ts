import { extensionName } from '../../extension-name';

import { Readable } from 'stream';
import { CoverageDecorations } from '../value-objects/coverage-decorations';

import { chain } from 'stream-chain';
import { parser } from 'stream-json';
import { pick } from 'stream-json/filters/Pick';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { disassembler } from 'stream-json/Disassembler';
import { streamObject } from 'stream-json/streamers/StreamObject';

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
        parser({ emitClose: true }),
        pick({ filter: 'data' }),
        streamArray(),
        disassembler(),
        pick({ filter: 'value' }),
        streamObject()
      ]);

      pipeline.on('error', error => { reject(UncoveredCodeRegionsCollector.buildErrorMessage(error.message)); });

      let dataFound = false;
      pipeline
        .on('data', _chunk => { dataFound = true; })
        .on('close', () => {
          if (!dataFound)
            return reject(UncoveredCodeRegionsCollector.buildErrorMessage());

          resolve(new CoverageDecorations({ fileDecorations: [] }));
        });
    });
  }

  private static buildErrorMessage(extra?: string) {
    const base = 'Invalid coverage information file have been found in the build tree directory. ' +
      'Coverage information file must contain llvm coverage report in json format. ' +
      'Ensure that both ' +
      `'${extensionName}: Build Tree Directory' and '${extensionName}: Coverage Info File Name' ` +
      'settings are correctly set.';

    if (extra)
      return `${base}\n${extra}`;

    return base;
  }

  private readonly streamBuilder: StreamBuilder;
};
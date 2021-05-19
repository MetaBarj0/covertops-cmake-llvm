import { extensionName } from '../../extension-name';

import { Readable } from 'stream';
import { CoverageDecorations } from '../value-objects/coverage-decorations';

export type StreamBuilder = {
  createReadStreamFromPath(path: string): Readable;
};

export class UncoveredCodeRegionsCollector {
  constructor(streamBuilder: StreamBuilder) {
    this.streamBuilder = streamBuilder;
  }

  collectUncoveredCodeRegions(_sourceFilePath: string) {
    return new Promise<CoverageDecorations>((_resolve, reject) => {
      reject('Coverage information file must contain llvm coverage report in json format. ' +
        'Ensure that both ' +
        `'${extensionName}: Build Tree Directory' and '${extensionName}: Coverage Info File Name' ` +
        'settings are correctly set.');
    });
  }

  private readonly streamBuilder: StreamBuilder;
};
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
      reject(UncoveredCodeRegionsCollector.buildErrorMessage('Not yet Implemented'));
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
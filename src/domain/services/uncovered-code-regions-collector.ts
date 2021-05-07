import { extensionName } from '../../extension-name';

import { Readable } from 'stream';
import { parser } from 'stream-json/Parser';
import { chain } from 'stream-chain';

export type StreamBuilder = {
  createReadStreamFromPath(path: string): Readable;
};
export class UncoveredCodeRegionsCollector {
  constructor(streamBuilder: StreamBuilder) {
    this.streamBuilder = streamBuilder;
  }

  collectUncoveredCodeRegions(_sourceFilePath: string) {
    return Promise.reject(
      'Invalid coverage information file have been found in the build tree directory. ' +
      'Coverage information file must contain llvm coverage report in json format. ' +
      'Ensure that both ' +
      `'${extensionName}: Build Tree Directory' and '${extensionName}: Coverage Info File Name' ` +
      'settings are correctly set.');
  }

  private readonly streamBuilder: StreamBuilder;
};
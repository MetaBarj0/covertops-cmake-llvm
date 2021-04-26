import { UncoveredCodeRegionsCollector } from "../ports/uncoveredCodeRegionsCollector";

import { Readable } from 'stream';

export class StreamedUncoveredCodeRegionsCollector implements UncoveredCodeRegionsCollector {
  constructor(inputStream: Readable) {
    this.inputStream = inputStream;
  }

  collectUncoveredCodeRegions(): Promise<void> {
    return Promise.reject(
      'Cannot collect any missing coverage information. Input is empty.\n' +
      'Ensure the cmake target you specified in settings lead to the creation of a coverage information file.');
  }

  private readonly inputStream: Readable;
};
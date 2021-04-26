import { UncoveredCodeRegionsCollector } from "../ports/uncoveredCodeRegionsCollector";

import { Readable } from 'stream';

export class StreamedUncoveredCodeRegionsCollector implements UncoveredCodeRegionsCollector {
  constructor(inputStream: Readable) {
    this.inputStream = inputStream;
  }

  collectUncoveredCodeRegions(): Promise<void> {
    return new Promise((_, reject) => {
      this.inputStream.on("readable", () => {
        if (this.inputStream.readableLength === 0)
          return reject(
            'Cannot collect any missing coverage information. Input is empty.\n' +
            'Ensure the cmake target you specified in `cmake-llvm-coverage: Cmake Target` setting lead to the creation ' +
            'of a coverage information file.');

        return reject(
          'Cannot collect any missing coverage information. Input is not a json document.\n' +
          'Ensure the file you specified in `cmake-llvm-coverage: Coverage Info File Name` setting ' +
          'target a json file containing coverage information.'
        );
      });
    });
  }

  private readonly inputStream: Readable;
};
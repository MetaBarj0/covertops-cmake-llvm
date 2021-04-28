import { UncoveredCodeRegionsCollector } from "../domain/ports/uncovered-code-regions-collector";

import { Readable } from 'stream';

import { parser } from 'stream-json/Parser';
import { chain } from 'stream-chain';

export class StreamedUncoveredCodeRegionsCollector implements UncoveredCodeRegionsCollector {
  constructor(inputStream: Readable) {
    this.inputStream = inputStream;
  }

  collectUncoveredCodeRegions(): Promise<void> {
    return new Promise((resolve, reject) => {
      let empty = true;

      chain([
        this.inputStream,
        parser({ streamKeys: false, streamValues: false })
      ])
        .on('error', () => {
          return this.becauseOfInvalidJson(reject);
        })
        .on('data', _ => {
          empty = false;
        })
        .on('end', () => {
          if (empty)
            return this.becauseOfInvalidJson(reject);
          return resolve();
        });
    });
  }

  private readonly inputStream: Readable;

  private becauseOfInvalidJson(reject: (reason?: any) => void): void {
    reject(
      'Cannot collect any missing coverage information. Input is not a json document.\n' +
      'Ensure the file you specified in `cmake-llvm-coverage: Coverage Info File Name` setting ' +
      'target a json file containing coverage information.'
    );
  }
};
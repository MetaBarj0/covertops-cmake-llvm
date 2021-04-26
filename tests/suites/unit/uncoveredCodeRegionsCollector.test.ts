import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import { StreamedUncoveredCodeRegionsCollector } from '../../../src/adapters/streamedUncoveredCodeRegionsCollector';

import { Readable, ReadableOptions } from 'stream';

describe('UncoveredCodeRegionsCollector behavior', () => {
  it('should throw an exception when attempting to collect uncovered code region if the input stream is empty', () => {
    const collector = new StreamedUncoveredCodeRegionsCollector(buildEmptyInputStream());

    return collector.collectUncoveredCodeRegions().should.eventually.be.rejectedWith(
      'Cannot collect any missing coverage information. Input is empty.\n' +
      'Ensure the cmake target you specified in `cmake-llvm-coverage: Cmake Target` setting lead to the creation ' +
      'of a coverage information file.');
  });

  it('should throw an exception when attempting to collect uncovered code region if the input stream ' +
    'does not contain a json document.', () => {
      const collector = new StreamedUncoveredCodeRegionsCollector(buildNotJsonStream());

      return collector.collectUncoveredCodeRegions().should.eventually.be.rejectedWith(
        'Cannot collect any missing coverage information. Input is not a json document.\n' +
        'Ensure the file you specified in `cmake-llvm-coverage: Coverage Info File Name` setting ' +
        'target a json file containing coverage information.');
    });
});

function buildEmptyInputStream(): Readable {
  return new class extends Readable {
    constructor(options?: ReadableOptions) {
      super(options);
      this.push(null);
    }
  };
}

function buildNotJsonStream(): Readable {
  return Readable.from('foo');
}
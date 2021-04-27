import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import { StreamedUncoveredCodeRegionsCollector } from '../../../src/adapters/streamedUncoveredCodeRegionsCollector';

import { Readable } from 'stream';

describe('UncoveredCodeRegionsCollector behavior', () => {
  const theories = [buildNotJsonStream(), buildEmptyInputStream()];

  theories.forEach(readable => {
    it('should throw an exception when attempting to collect uncovered code regions if the input stream ' +
      'does not contain a json document.', () => {

        const collector = new StreamedUncoveredCodeRegionsCollector(readable);

        return collector.collectUncoveredCodeRegions().should.eventually.be.rejectedWith(
          'Cannot collect any missing coverage information. Input is not a json document.\n' +
          'Ensure the file you specified in `cmake-llvm-coverage: Coverage Info File Name` setting ' +
          'target a json file containing coverage information.');
      });
  });

  it('should not throw when attempting to collect uncovered code regions if the input stream ' +
    'is an empty json object', () => {
      const collector = new StreamedUncoveredCodeRegionsCollector(buildEmptyJsonObjectStream());

      return collector.collectUncoveredCodeRegions().should.eventually.be.fulfilled;
    });
});

function buildEmptyInputStream(): Readable {
  const empty = (function* () { })();

  return Readable.from(empty);
}

function buildNotJsonStream(): Readable {
  return Readable.from('foo');
}

function buildEmptyJsonObjectStream(): Readable {
  return Readable.from(JSON.stringify({}));
}

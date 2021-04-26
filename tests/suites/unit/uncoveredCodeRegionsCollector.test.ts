import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import { StreamedUncoveredCodeRegionsCollector } from '../../../src/adapters/streamedUncoveredCodeRegionsCollector';

import { Readable } from 'stream';

describe('UncoveredCodeRegionsCollector behavior', () => {
  it('should throw an exception when attempting to collect uncovered code region if the input stream is empty', () => {
    const collector = new StreamedUncoveredCodeRegionsCollector(buildEmptyInputStream());

    return collector.collectUncoveredCodeRegions().should.eventually.be.rejectedWith(
      'Cannot collect any missing coverage information. Input is empty.\n' +
      'Ensure the cmake target you specified in settings lead to the creation of a coverage information file.');
  });
});

function buildEmptyInputStream(): Readable {
  return new class extends Readable { };
}

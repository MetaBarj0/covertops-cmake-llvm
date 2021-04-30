import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import { UncoveredCodeRegionsCollector } from '../../../src/domain/services/uncovered-code-regions-collector';
import { stream } from '../../builders/fake-adapters';

import buildEmptyInputStream = stream.buildEmptyInputStream;
import buildEmptyJsonObjectStream = stream.buildEmptyJsonObjectStream;
import buildNotJsonStream = stream.buildNotJsonStream;

describe('UncoveredCodeRegionsCollector behavior', () => {
  const theories = [buildNotJsonStream(), buildEmptyInputStream()];

  theories.forEach(readable => {
    it('should throw an exception when attempting to collect uncovered code regions if the input stream ' +
      'does not contain a json document.', () => {

        const collector = new UncoveredCodeRegionsCollector(readable);

        return collector.collectUncoveredCodeRegions().should.eventually.be.rejectedWith(
          'Cannot collect any missing coverage information. Input is not a json document.\n' +
          'Ensure the file you specified in `cmake-llvm-coverage: Coverage Info File Name` setting ' +
          'target a json file containing coverage information.');
      });
  });

  it('should not throw when attempting to collect uncovered code regions if the input stream ' +
    'is an empty json object', () => {
      const collector = new UncoveredCodeRegionsCollector(buildEmptyJsonObjectStream());

      return collector.collectUncoveredCodeRegions().should.eventually.be.fulfilled;
    });
});
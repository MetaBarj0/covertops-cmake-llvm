import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

import { UncoveredCodeRegionsCollector } from '../../../src/domain/services/uncovered-code-regions-collector';

import { stream as s } from '../../builders/fake-adapters';

chai.use(chaiAsPromised);
chai.should();

describe('The collection of uncovered code region provided by a stream containing a JSON document', () => {
  it('should fail to parse an empty stream disregarding asked source file', () => {
    const collector = new UncoveredCodeRegionsCollector(s.buildFakeStreamBuilder(s.buildEmptyReadableStream));

    return collector.collectUncoveredCodeRegions('').should.eventually.be.rejected;
  });

  it('should fail to parse content that is not a json document disregarding asked source file', () => {
    const collector = new UncoveredCodeRegionsCollector(s.buildFakeStreamBuilder(s.buildNotJsonStream));

    return collector.collectUncoveredCodeRegions('').should.eventually.be.rejected;
  });
});
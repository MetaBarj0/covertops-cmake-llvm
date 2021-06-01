import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

import { UncoveredCodeRegionsCollector } from '../../../src/domain/services/uncovered-code-regions-collector';
import { extensionName } from '../../../src/extension-name';

import { stream as s } from '../../builders/fake-adapters';
import { Readable } from 'stream';
import { chain } from 'stream-chain';
import { parser } from 'stream-json';
import { pick } from 'stream-json/filters/Pick';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { disassembler } from 'stream-json/Disassembler';
import { streamObject } from 'stream-json/streamers/StreamObject';

chai.use(chaiAsPromised);
chai.should();

describe('The collection of uncovered code region provided by a stream containing a JSON document', () => {
  it('should fail to parse an empty stream disregarding asked source file', () => {
    const collector = new UncoveredCodeRegionsCollector(s.buildFakeStreamBuilder(s.buildEmptyReadableStream));

    return collector.collectUncoveredCodeRegions('').should.eventually.be.rejected;
  });

  it('should fail to parse content that is not a json document disregarding asked source file', () => {
    const collector = new UncoveredCodeRegionsCollector(s.buildFakeStreamBuilder(s.buildNotJsonStream));

    return collector.collectUncoveredCodeRegions('').should.eventually.be.rejectedWith(
      'Invalid coverage information file have been found in the build tree directory. ' +
      'Coverage information file must contain llvm coverage report in json format. ' +
      'Ensure that both ' +
      `'${extensionName}: Build Tree Directory' and '${extensionName}: Coverage Info File Name' ` +
      'settings are correctly set.');
  });
});

describe('the stream forking of coverage information provided by the LLVM', () => {
  it('should be possible to extract the root "data" array from the full json stream', () => {
    const fullStream = s.buildValidLlvmCoverageJsonObjectStream();

    const dataObjectStream = extractDataObjectStreamFromFullStream(fullStream);

    const dataObjectStreamPromise = new Promise<void>((resolve, _reject) => {
      dataObjectStream.on('data', _chunk => { resolve(); });
    });

    return dataObjectStreamPromise.should.eventually.be.fulfilled;
  });
});

function extractDataObjectStreamFromFullStream(fullStream: Readable) {
  const pipeline = chain([
    fullStream,
    parser(),
    pick({ filter: 'data' }),
    streamArray(),
    disassembler(),
    pick({ filter: 'value' }),
    streamObject()
  ]);

  return pipeline;
}
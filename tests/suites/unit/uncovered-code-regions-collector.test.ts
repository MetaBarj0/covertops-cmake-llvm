import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

import { UncoveredCodeRegionsCollector } from '../../../src/domain/services/uncovered-code-regions-collector';
import { Summary } from '../../../src/domain/value-objects/collected-coverage-info';
import { extensionName } from '../../../src/extension-name';

import { stream as s } from '../../builders/fake-adapters';
import { Readable } from 'stream';
import { chain } from 'stream-chain';
import { parser } from 'stream-json';
import { pick } from 'stream-json/filters/Pick';
import { streamArray } from 'stream-json/streamers/StreamArray';

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

  it('should be possible to extract the "files" array from the data object', () => {
    const fullStream = s.buildValidLlvmCoverageJsonObjectStream();
    const dataObjectStream = extractDataObjectStreamFromFullStream(fullStream);

    const filesArrayStream = extractFilesArrayStreamFromDataObjectStream(dataObjectStream);

    const filesArrayStreamPromise = new Promise<void>((resolve, _reject) => {
      filesArrayStream.on('data', _chunk => { resolve(); });
    });

    return filesArrayStreamPromise.should.eventually.be.fulfilled;
  });

  it('should be possible to get file summary coverage info from "files" stream', async () => {
    const fullStream = s.buildValidLlvmCoverageJsonObjectStream();
    const dataObjectStream = extractDataObjectStreamFromFullStream(fullStream);
    const filesArrayStream = extractFilesArrayStreamFromDataObjectStream(dataObjectStream);

    const fileSummary = await extractFileSummaryFromFilesArrayStreamFor(filesArrayStream, '/a/source/file.cpp');

    fileSummary.count.should.be.equal(2);
    fileSummary.covered.should.be.equal(2);
    fileSummary.notCovered.should.be.equal(0);
    fileSummary.percent.should.be.equal(100);
  });
});

function extractDataObjectStreamFromFullStream(fullStream: Readable) {
  const pipeline = chain([
    fullStream,
    parser({ streamValues: true }),
    pick({ filter: 'data' }),
    streamArray(),
    keyValueItem => keyValueItem.key === 0 ? keyValueItem.value : null
  ]);

  return pipeline;
}

function extractFilesArrayStreamFromDataObjectStream(dataObjectStream: Readable) {
  const pipeline = chain([
    dataObjectStream,
    properties => properties.files
  ]);

  return pipeline;
}

function extractFileSummaryFromFilesArrayStreamFor(filesArrayStream: Readable, sourceFilePath: string) {
  const pipeline = chain([
    filesArrayStream,
    summary => summary.filename === sourceFilePath ? summary : null
  ]);

  return new Promise<Summary>((resolve, _reject) => {
    pipeline.once('data', chunk => {
      const s = chunk.summary.regions;

      resolve({
        count: s.count,
        covered: s.covered,
        notCovered: s.notcovered,
        percent: s.percent
      });
    });
  });
}
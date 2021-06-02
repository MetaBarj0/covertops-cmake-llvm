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

// TODO: inside out part. Requalify tests as soon as needed
describe('the stream forking of coverage information provided by the LLVM', () => {
  it('should be possible to get an awaitable summary coverage report for a file', async () => {
    const path = '/a/source/file.cpp';
    const fullStream = s.buildValidLlvmCoverageJsonObjectStream();

    const summary = await reportCoverageSummaryFor(fullStream, path);

    summary.count.should.be.equal(2);
    summary.covered.should.be.equal(2);
    summary.notCovered.should.be.equal(0);
    summary.percent.should.be.equal(100);
  });

  it('should be possible to asynchronously iterate coverage info for regions for a file', async () => {
    const path = '/a/source/file.cpp';
    const fullStream = s.buildValidLlvmCoverageJsonObjectStream();

    const regionsCoverage = reportUncoveredRegionsFor(fullStream, path);

    for await (const regionCoverage of regionsCoverage)
      regionCoverage?.should.not.be.null;
  });

  [
    s.buildEmptyReadableStream(),
    s.buildNotJsonStream(),
    s.buildInvalidLlvmCoverageJsonObjectStream()
  ].forEach(stream => {
    it('should fail when attempting to access summary coverage info from an invalid stream', () => {
      return reportCoverageSummaryFor(stream, 'path is not important here').should.eventually.be.rejectedWith(
        'Invalid coverage information file have been found in the build tree directory. ' +
        'Coverage information file must contain llvm coverage report in json format. ' +
        'Ensure that both ' +
        `'${extensionName}: Build Tree Directory' and '${extensionName}: Coverage Info File Name' ` +
        'settings are correctly set.');
    });

    it('should fail when attempting to access uncovered regions info from an invalid stream', () => {
      const regionsCoverage = reportUncoveredRegionsFor(stream, 'path is not important here');

      return (async () => { for await (const _regionCoverage of regionsCoverage) { } })()
        .should.eventually.be.rejectedWith(
          'Invalid coverage information file have been found in the build tree directory. ' +
          'Coverage information file must contain llvm coverage report in json format. ' +
          'Ensure that both ' +
          `'${extensionName}: Build Tree Directory' and '${extensionName}: Coverage Info File Name' ` +
          'settings are correctly set.');
    });
  });
});

// TODO: refacto code into proper source files
function reportCoverageSummaryFor(fullStream: Readable, sourceFilePath: string) {
  const pipeline = chain([
    fullStream,
    parser({ streamValues: true }),
    pick({ filter: 'data' }),
    streamArray(),
    dataItem => {
      if (dataItem.key !== 0)
        return null;

      const files = dataItem.value.files;

      if (!files.filter((file: any) => file.filename === sourceFilePath))
        return null;

      return files;
    }
  ]);

  return new Promise<Summary>((resolve, reject) => {
    pipeline.once('data', chunk => {
      const s = chunk.summary.regions;

      resolve({
        count: s.count,
        covered: s.covered,
        notCovered: s.notcovered,
        percent: s.percent
      });
    })
      .once('error', err => {
        // TODO: reject should use Error type constructor
        reject('Invalid coverage information file have been found in the build tree directory. ' +
          'Coverage information file must contain llvm coverage report in json format. ' +
          'Ensure that both ' +
          `'${extensionName}: Build Tree Directory' and '${extensionName}: Coverage Info File Name' ` +
          'settings are correctly set.' + err.message);
      });
  });
}

function reportUncoveredRegionsFor(fullStream: Readable, sourceFilePath: string) {
  const pipeline = chain([
    fullStream,
    parser({ streamValues: true }),
    pick({ filter: 'data' }),
    streamArray(),
    dataItem => {
      if (dataItem.key !== 0)
        return null;

      const functions = dataItem.value.functions;

      const fn = functions.find((f: { filenames: ReadonlyArray<string> }) => f.filenames[0] === sourceFilePath);

      return fn?.regions;
    }
  ]);

  return {
    [Symbol.asyncIterator]() {
      type UncoveredRegion = [number, number, number, number, number, number, number, number];

      type Iterator<T> = {
        readonly value?: T,
        readonly done: boolean
      };

      return {
        async next() {
          await new Promise<void>((resolve, reject) => {
            pipeline
              .once('readable', () => { resolve(); })
              .once('end', () => { resolve(); })
              .once('error', err => {
                reject('Invalid coverage information file have been found in the build tree directory. ' +
                  'Coverage information file must contain llvm coverage report in json format. ' +
                  'Ensure that both ' +
                  `'${extensionName}: Build Tree Directory' and '${extensionName}: Coverage Info File Name' ` +
                  'settings are correctly set.' + err.message);
              });
          });

          const uncoveredRegion = <UncoveredRegion>pipeline.read(1);

          if (uncoveredRegion === null)
            return new Promise<Iterator<UncoveredRegion>>(resolve => { resolve({ done: true }); });

          return new Promise<Iterator<UncoveredRegion>>(resolve => { resolve({ done: false, value: uncoveredRegion }); });
        }
      };
    }
  };
}
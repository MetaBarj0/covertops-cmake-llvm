import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

import { CoverageCollector } from '../../../src/domain/services/coverage-info-collector';
import { extensionId } from '../../../src/definitions';
import { RegionCoverageInfo } from '../../../src/domain/value-objects/region-coverage-info';

import { stream as s } from '../../builders/fake-adapters';

chai.use(chaiAsPromised);
chai.should();

describe('The collection of coverage summary and uncovered code regions with an invalid input readable stream', () => {
  [
    s.buildEmptyReadableStream,
    s.buildInvalidLlvmCoverageJsonObjectStream,
    s.buildNotJsonStream
  ].forEach(streamFactory => {
    it('should fail to access to coverage summary', () => {
      const collector = new CoverageCollector(s.buildFakeStreamBuilder(streamFactory));

      return collector.collectFor('').summary
        .should.eventually.be.rejectedWith('Invalid coverage information file have been found in the build tree directory. ' +
          'Coverage information file must contain llvm coverage report in json format. ' +
          'Ensure that both ' +
          `'${extensionId}: Build Tree Directory' and '${extensionId}: Coverage Info File Name' ` +
          'settings are correctly set.');
    });
  });

  [
    s.buildEmptyReadableStream,
    s.buildInvalidLlvmCoverageJsonObjectStream,
    s.buildNotJsonStream
  ].forEach(streamFactory => {
    it('should fail to access to uncovered regions', () => {
      const collector = new CoverageCollector(s.buildFakeStreamBuilder(streamFactory));
      const filecollected = collector.collectFor('');
      const iterateOnUncoveredRegions = async () => { for await (const _region of filecollected.uncoveredRegions()); };

      return iterateOnUncoveredRegions()
        .should.eventually.be.rejectedWith('Invalid coverage information file have been found in the build tree directory. ' +
          'Coverage information file must contain llvm coverage report in json format. ' +
          'Ensure that both ' +
          `'${extensionId}: Build Tree Directory' and '${extensionId}: Coverage Info File Name' ` +
          'settings are correctly set.');
    });
  });
});

describe('The collection of coverage summary and uncovered code regions with a valid input readable stream', () => {
  it('should fail to provide coverage summary for an unhandled source file', () => {
    const collector = new CoverageCollector(s.buildFakeStreamBuilder(s.buildValidLlvmCoverageJsonObjectStream));
    const sourceFilePath = '/an/unhandled/source/file.cpp';

    return collector.collectFor(sourceFilePath).summary
      .should.eventually.be.rejectedWith('Cannot find any summary coverage info for the file ' +
        `${sourceFilePath}. Ensure this source file is covered by a test in your project.`);
  });

  it('should succeed in provided summary coverage info for handled source file', async () => {
    const collector = new CoverageCollector(s.buildFakeStreamBuilder(s.buildValidLlvmCoverageJsonObjectStream));
    const sourceFilePath = '/a/source/file.cpp';

    const summary = await collector.collectFor(sourceFilePath).summary;

    summary.count.should.be.equal(2);
    summary.covered.should.be.equal(2);
    summary.notCovered.should.be.equal(0);
    summary.percent.should.be.equal(100);
  });

  it('should fail to provide uncovered code regions for an unhandled source file', () => {
    const collector = new CoverageCollector(s.buildFakeStreamBuilder(s.buildValidLlvmCoverageJsonObjectStream));
    const sourceFilePath = '/an/unhandled/source/file.cpp';
    const filecollected = collector.collectFor(sourceFilePath);
    const iterateOnUncoveredRegions = async () => { for await (const _region of filecollected.uncoveredRegions()); };

    return iterateOnUncoveredRegions()
      .should.eventually.be.rejectedWith('Cannot find any uncovered code regions for the file ' +
        `${sourceFilePath}. Ensure this source file is covered by a test in your project.`);
  });

  it('should succeed to provide uncovered regions for a handled source file', async () => {
    const collector = new CoverageCollector(s.buildFakeStreamBuilder(s.buildValidLlvmCoverageJsonObjectStream));
    const sourceFilePath = '/a/source/file.cpp';

    const regions = await collector.collectFor(sourceFilePath).uncoveredRegions();

    const uncoveredRegions: Array<RegionCoverageInfo> = [];

    for await (const region of regions)
      uncoveredRegions.push(region);

    uncoveredRegions.length.should.be.equal(1);

    const uncoveredRegion = uncoveredRegions[0];

    uncoveredRegion.range.should.be.deep.equal({
      start: {
        line: 6,
        character: 53
      },
      end: {
        line: 6,
        character: 71
      }
    });
  });
});
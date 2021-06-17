import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as CoverageInfoCollector from '../../../src/domain/services/internal/coverage-info-collector';
import * as definitions from '../../../src/definitions';
import { RegionCoverageInfo } from '../../../src/domain/value-objects/region-coverage-info';
import { ProgressLike } from '../../../src/domain/services/internal/progress-reporter';

import { vscodeWorkspace as v } from '../../faked-adapters/vscode-workspace';
import { inputStream as i } from '../../faked-adapters/input-stream';
import { globbing as g } from '../../faked-adapters/globbing';
import { progressReporter as pr } from '../../faked-adapters/progress-reporter';

describe('Unit test suite', () => {
  describe('the coverage info collector behavior', () => {
    describe('with invalid input readable streams', () => {
      describe('collect coverage info summary', shouldFailToCollectCoverageInfoSummaryBecauseOfInvalidStream);
      describe('collect uncovered region coverage info', shouldFailToCollectUncoveredRegionsBecauseOfInvalidStream);
    });
    describe('with a valid input readable stream', () => {
      describe('for an unhandled source file', () => {
        describe('collect coverage info summary', shouldFailToCollectCoverageInfoSummaryBecauseOfUnhandledSourceFile);
        describe('collect uncovered region coverage info', shouldFailToCollectUncoveredRegionsBecauseOfUnhandledSourceFile);
      });
      describe('for a handled source file', () => {
        describe('collect coverage info summary', shouldSucceedToCollectCoverageInfoSummary);
        describe('collect uncovered region coverage info', shouldSucceedToCollectUncoveredRegions);
      });
    });
  });
});

function shouldFailToCollectCoverageInfoSummaryBecauseOfInvalidStream() {
  setupCollectorsWithInvalidStreams().forEach(async collector => {
    const coverageInfo = await collector.collectFor('');

    return coverageInfo.summary
      .should.eventually.be.rejectedWith('Invalid coverage information file have been found in the build tree directory. ' +
        'Coverage information file must contain llvm coverage report in json format. ' +
        'Ensure that both ' +
        `'${definitions.extensionNameInSettings}: Build Tree Directory' and ` +
        `'${definitions.extensionNameInSettings}: Coverage Info File Name' ` +
        'settings are correctly set.');
  });
}

function shouldFailToCollectUncoveredRegionsBecauseOfInvalidStream() {
  setupCollectorsWithInvalidStreams().forEach(async collector => {
    it('should fail to access to uncovered regions', async () => {
      const coverageInfo = await collector.collectFor('');
      const iterateOnUncoveredRegions = async () => { for await (const _region of coverageInfo.uncoveredRegions); };

      return iterateOnUncoveredRegions()
        .should.eventually.be.rejectedWith('Invalid coverage information file have been found in the build tree directory. ' +
          'Coverage information file must contain llvm coverage report in json format. ' +
          'Ensure that both ' +
          `'${definitions.extensionNameInSettings}: Build Tree Directory' and ` +
          `'${definitions.extensionNameInSettings}: Coverage Info File Name' ` +
          'settings are correctly set.');
    });
  });
}

function shouldFailToCollectCoverageInfoSummaryBecauseOfUnhandledSourceFile() {
  it('should fail to provide coverage summary for an unhandled source file', async () => {
    const progressReporter = pr.buildFakeProgressReporter();

    const collector = setupCollectorWithValidStreamAndProgressReporter(progressReporter);

    const sourceFilePath = '/an/unhandled/source/file.cpp';

    const coverageInfo = await collector.collectFor(sourceFilePath);

    return coverageInfo.summary
      .should.eventually.be.rejectedWith('Cannot find any summary coverage info for the file ' +
        `${sourceFilePath}. Ensure this source file is covered by a test in your project.`);
  });
}

function shouldFailToCollectUncoveredRegionsBecauseOfUnhandledSourceFile() {
  it('should fail to provide uncovered code regions for an unhandled source file', async () => {
    const progressReporter = pr.buildFakeProgressReporter();

    const collector = setupCollectorWithValidStreamAndProgressReporter(progressReporter);

    const sourceFilePath = '/an/unhandled/source/file.cpp';
    const coverageInfo = await collector.collectFor(sourceFilePath);
    const iterateOnUncoveredRegions = async () => { for await (const _region of coverageInfo.uncoveredRegions); };

    return iterateOnUncoveredRegions()
      .should.eventually.be.rejectedWith('Cannot find any uncovered code regions for the file ' +
        `${sourceFilePath}. Ensure this source file is covered by a test in your project.`);
  });
}

function shouldSucceedToCollectCoverageInfoSummary() {
  it('should succeed in provided summary coverage info for handled source file in 2 discrete steps', async () => {
    const spy = pr.buildSpyOfProgressReporter(pr.buildFakeProgressReporter());
    const progressReporter = spy.object;

    const collector = setupCollectorWithValidStreamAndProgressReporter(progressReporter);

    const coverageInfo = await collector.collectFor('/a/source/file.cpp');

    const summary = await coverageInfo.summary;

    summary.count.should.be.equal(2);
    summary.covered.should.be.equal(2);
    summary.notCovered.should.be.equal(0);
    summary.percent.should.be.equal(100);

    spy.countFor('report').should.be.equal(2);
  });
}

function shouldSucceedToCollectUncoveredRegions() {
  it('should succeed to provide uncovered regions for a handled source file in 2 discrete steps', async () => {
    const spy = pr.buildSpyOfProgressReporter(pr.buildFakeProgressReporter());
    const progressReporter = spy.object;

    const collector = setupCollectorWithValidStreamAndProgressReporter(progressReporter);

    const coverageInfo = await collector.collectFor('/a/source/file.cpp');
    const regions = coverageInfo.uncoveredRegions;

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

    spy.countFor('report').should.be.equal(2);
  });
}

function setupCollectorsWithInvalidStreams() {
  const collectors: Array<ReturnType<typeof CoverageInfoCollector.make>> = [];

  [
    i.buildEmptyReadableStream,
    i.buildInvalidLlvmCoverageJsonObjectStream,
    i.buildNotJsonStream
  ].forEach(streamFactory => {
    collectors.push(CoverageInfoCollector.make({
      globSearch: g.buildFakeGlobSearchForExactlyOneMatch(),
      workspace: v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
      llvmCoverageInfoStreamBuilder: i.buildFakeStreamBuilder(streamFactory),
      progressReporter: pr.buildFakeProgressReporter()
    }));
  });

  return collectors;
};

function setupCollectorWithValidStreamAndProgressReporter(progressReporter: ProgressLike) {
  return CoverageInfoCollector.make({
    globSearch: g.buildFakeGlobSearchForExactlyOneMatch(),
    workspace: v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
    llvmCoverageInfoStreamBuilder: i.buildFakeStreamBuilder(i.buildValidLlvmCoverageJsonObjectStream),
    progressReporter
  });
}

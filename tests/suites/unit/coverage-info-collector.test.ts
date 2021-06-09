import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as CoverageInfoCollector from '../../../src/domain/services/internal/coverage-info-collector';
import * as definitions from '../../../src/definitions';
import { RegionCoverageInfo } from '../../../src/domain/value-objects/region-coverage-info';

import { vscodeWorkspace as v } from '../../faked-adapters/vscode-workspace';
import { inputStream as i } from '../../faked-adapters/input-stream';
import { globbing as g } from '../../faked-adapters/globbing';

// TODO: describe the current suite of test that is executed to easily find where something breaks
describe('The collection of coverage summary and uncovered code regions with an invalid input readable stream', () => {
  [
    i.buildEmptyReadableStream,
    i.buildInvalidLlvmCoverageJsonObjectStream,
    i.buildNotJsonStream
  ].forEach(streamFactory => {
    it('should fail to access to coverage summary', async () => {
      const collector = CoverageInfoCollector.make({
        globSearch: g.buildFakeGlobSearchForExactlyOneMatch(),
        workspace: v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
        llvmCoverageInfoStreamBuilder: i.buildFakeStreamBuilder(streamFactory)
      });

      const coverageInfo = await collector.collectFor('');

      return coverageInfo.summary
        .should.eventually.be.rejectedWith('Invalid coverage information file have been found in the build tree directory. ' +
          'Coverage information file must contain llvm coverage report in json format. ' +
          'Ensure that both ' +
          `'${definitions.extensionNameInSettings}: Build Tree Directory' and ` +
          `'${definitions.extensionNameInSettings}: Coverage Info File Name' ` +
          'settings are correctly set.');
    });
  });

  [
    i.buildEmptyReadableStream,
    i.buildInvalidLlvmCoverageJsonObjectStream,
    i.buildNotJsonStream
  ].forEach(streamFactory => {
    it('should fail to access to uncovered regions', async () => {
      // TODO: refacto duplicated arrange sections
      const collector = CoverageInfoCollector.make({
        globSearch: g.buildFakeGlobSearchForExactlyOneMatch(),
        workspace: v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
        llvmCoverageInfoStreamBuilder: i.buildFakeStreamBuilder(streamFactory)
      });

      const coverageInfo = await collector.collectFor('');
      const iterateOnUncoveredRegions = async () => { for await (const _region of coverageInfo.uncoveredRegions()); };

      return iterateOnUncoveredRegions()
        .should.eventually.be.rejectedWith('Invalid coverage information file have been found in the build tree directory. ' +
          'Coverage information file must contain llvm coverage report in json format. ' +
          'Ensure that both ' +
          `'${definitions.extensionNameInSettings}: Build Tree Directory' and ` +
          `'${definitions.extensionNameInSettings}: Coverage Info File Name' ` +
          'settings are correctly set.');
    });
  });
});

describe('The collection of coverage summary and uncovered code regions with a valid input readable stream', () => {
  it('should fail to provide coverage summary for an unhandled source file', async () => {
    const collector = CoverageInfoCollector.make({
      globSearch: g.buildFakeGlobSearchForExactlyOneMatch(),
      workspace: v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
      llvmCoverageInfoStreamBuilder: i.buildFakeStreamBuilder(i.buildValidLlvmCoverageJsonObjectStream)
    });

    const sourceFilePath = '/an/unhandled/source/file.cpp';

    const coverageInfo = await collector.collectFor(sourceFilePath);

    return coverageInfo.summary
      .should.eventually.be.rejectedWith('Cannot find any summary coverage info for the file ' +
        `${sourceFilePath}. Ensure this source file is covered by a test in your project.`);
  });

  it('should succeed in provided summary coverage info for handled source file', async () => {
    const collector = CoverageInfoCollector.make({
      globSearch: g.buildFakeGlobSearchForExactlyOneMatch(),
      workspace: v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
      llvmCoverageInfoStreamBuilder: i.buildFakeStreamBuilder(i.buildValidLlvmCoverageJsonObjectStream)
    });

    const coverageInfo = await collector.collectFor('/a/source/file.cpp');

    const summary = await coverageInfo.summary;

    summary.count.should.be.equal(2);
    summary.covered.should.be.equal(2);
    summary.notCovered.should.be.equal(0);
    summary.percent.should.be.equal(100);
  });

  it('should fail to provide uncovered code regions for an unhandled source file', async () => {
    const collector = CoverageInfoCollector.make({
      globSearch: g.buildFakeGlobSearchForExactlyOneMatch(),
      workspace: v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
      llvmCoverageInfoStreamBuilder: i.buildFakeStreamBuilder(i.buildValidLlvmCoverageJsonObjectStream)
    });

    const sourceFilePath = '/an/unhandled/source/file.cpp';
    const coverageInfo = await collector.collectFor(sourceFilePath);
    const iterateOnUncoveredRegions = async () => { for await (const _region of coverageInfo.uncoveredRegions()); };

    return iterateOnUncoveredRegions()
      .should.eventually.be.rejectedWith('Cannot find any uncovered code regions for the file ' +
        `${sourceFilePath}. Ensure this source file is covered by a test in your project.`);
  });

  it('should succeed to provide uncovered regions for a handled source file', async () => {
    const collector = CoverageInfoCollector.make({
      globSearch: g.buildFakeGlobSearchForExactlyOneMatch(),
      workspace: v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
      llvmCoverageInfoStreamBuilder: i.buildFakeStreamBuilder(i.buildValidLlvmCoverageJsonObjectStream)
    });

    const coverageInfo = await collector.collectFor('/a/source/file.cpp');
    const regions = coverageInfo.uncoveredRegions();

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
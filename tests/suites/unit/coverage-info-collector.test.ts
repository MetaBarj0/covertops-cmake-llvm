import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as Imports from './imports';

import { Readable } from 'stream';

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
  const collectorsAndOutputChannelSpies = buildCoverageInfoCollectorsAndOutputChannelSpiesUsingStreamFactories([
    Imports.Fakes.Adapters.FileSystem.buildEmptyReadableStream,
    Imports.Fakes.Adapters.FileSystem.buildInvalidLlvmCoverageJsonObjectStream,
    Imports.Fakes.Adapters.FileSystem.buildNotJsonStream
  ]);

  collectorsAndOutputChannelSpies.forEach(async collectorAndOutputChannelSpy => {
    it('should fail to access to coverage info summary and report to output channel', async () => {
      const collector = collectorAndOutputChannelSpy.coverageInfoCollector;
      const outputChannelSpy = collectorAndOutputChannelSpy.outputChannelSpy;

      const coverageInfo = await collector.collectFor('a');

      return coverageInfo.summary
        .catch((error: Error) => error)
        .then(error => {
          (<Error>error).message.should.contain('Invalid coverage information file have been found in the build tree directory. ' +
            'Coverage information file must contain llvm coverage report in json format. ' +
            'Ensure that both ' +
            `'${Imports.Extension.Definitions.extensionNameInSettings}: Build Tree Directory' and ` +
            `'${Imports.Extension.Definitions.extensionNameInSettings}: Coverage Info File Name' ` +
            'settings are correctly set.');

          outputChannelSpy.countFor('appendLine').should.be.equal(1);
        });
    });
  });
}

function shouldFailToCollectUncoveredRegionsBecauseOfInvalidStream() {
  const collectorsAndOutputChannelSpies = buildCoverageInfoCollectorsAndOutputChannelSpiesUsingStreamFactories([
    Imports.Fakes.Adapters.FileSystem.buildEmptyReadableStream,
    Imports.Fakes.Adapters.FileSystem.buildInvalidLlvmCoverageJsonObjectStream,
    Imports.Fakes.Adapters.FileSystem.buildNotJsonStream
  ]);

  collectorsAndOutputChannelSpies.forEach(async collectorAndOutputChannelSpy => {
    it('should fail to access to uncovered regions and report in output channel', async () => {
      const collector = collectorAndOutputChannelSpy.coverageInfoCollector;
      const outputChannelSpy = collectorAndOutputChannelSpy.outputChannelSpy;

      const coverageInfo = await collector.collectFor('a');
      const iterateOnUncoveredRegions = async () => { for await (const _region of coverageInfo.uncoveredRegions); };

      return iterateOnUncoveredRegions()
        .catch((error: Error) => error)
        .then(error => {
          (<Error>error).message.should.contain('Invalid coverage information file have been found in the build tree directory. ' +
            'Coverage information file must contain llvm coverage report in json format. ' +
            'Ensure that both ' +
            `'${Imports.Extension.Definitions.extensionNameInSettings}: Build Tree Directory' and ` +
            `'${Imports.Extension.Definitions.extensionNameInSettings}: Coverage Info File Name' ` +
            'settings are correctly set.');

          outputChannelSpy.countFor('appendLine').should.be.equal(1);
        });
    });
  });
}

function shouldFailToCollectCoverageInfoSummaryBecauseOfUnhandledSourceFile() {
  it('should fail to provide coverage summary for an unhandled source file and report to output channel', async () => {
    const collectorAndSpies = buildCoverageInfoCollectorAndSpiesForProgressReportAndOutputChannel();
    const collector = collectorAndSpies.coverageInfoCollector;
    const outputChannelSpy = collectorAndSpies.outputChannelSpy;

    const sourceFilePath = '/an/unhandled/source/file.cpp';

    const coverageInfo = await collector.collectFor(sourceFilePath);

    return coverageInfo.summary
      .catch((error: Error) => error)
      .then(error => {
        (<Error>error).message.should.contain('Cannot find any summary coverage info for the file ' +
          `${sourceFilePath}. Ensure this source file is covered by a test in your project.`);

        outputChannelSpy.countFor('appendLine').should.be.equal(1);
      });
  });
}

function shouldFailToCollectUncoveredRegionsBecauseOfUnhandledSourceFile() {
  it('should fail to provide uncovered code regions for an unhandled source file', async () => {
    const collectorAndSpies = buildCoverageInfoCollectorAndSpiesForProgressReportAndOutputChannel();
    const collector = collectorAndSpies.coverageInfoCollector;
    const outputChannelSpy = collectorAndSpies.outputChannelSpy;

    const sourceFilePath = '/an/unhandled/source/file.cpp';
    const coverageInfo = await collector.collectFor(sourceFilePath);
    const iterateOnUncoveredRegions = async () => { for await (const _region of coverageInfo.uncoveredRegions); };

    return iterateOnUncoveredRegions()
      .catch((error: Error) => error)
      .then(error => {
        (<Error>error).message.should.contain('Cannot find any uncovered code regions for the file ' +
          `${sourceFilePath}. Ensure this source file is covered by a test in your project.`);

        outputChannelSpy.countFor('appendLine').should.be.equal(1);
      });
  });
}

function shouldSucceedToCollectCoverageInfoSummary() {
  it('should succeed in provided summary coverage info for handled source file in 2 discrete steps', async () => {

    const collectorAndSpies = buildCoverageInfoCollectorAndSpiesForProgressReportAndOutputChannel();
    const collector = collectorAndSpies.coverageInfoCollector;
    const progressReporterSpy = collectorAndSpies.progressReporterSpy;

    const coverageInfo = await collector.collectFor('/a/source/file.cpp');

    const summary = await coverageInfo.summary;

    summary.count.should.be.equal(2);
    summary.covered.should.be.equal(2);
    summary.notCovered.should.be.equal(0);
    summary.percent.should.be.equal(100);

    progressReporterSpy.countFor('report').should.be.equal(2);
  });
}

function shouldSucceedToCollectUncoveredRegions() {
  it('should succeed to provide uncovered regions for a handled source file in 2 discrete steps', async () => {

    const collectorAndSpies = buildCoverageInfoCollectorAndSpiesForProgressReportAndOutputChannel();
    const collector = collectorAndSpies.coverageInfoCollector;
    const progressReporterSpy = collectorAndSpies.progressReporterSpy;

    const coverageInfo = await collector.collectFor('/a/source/file.cpp');
    const regions = coverageInfo.uncoveredRegions;

    const uncoveredRegions: Array<Imports.Domain.Abstractions.RegionCoverageInfo> = [];

    for await (const region of regions)
      uncoveredRegions.push(region);

    uncoveredRegions.length.should.be.equal(1);

    const uncoveredRegion = uncoveredRegions[0];

    uncoveredRegion.range.should.be.deep.equal({
      start: {
        line: 5,
        character: 52
      },
      end: {
        line: 5,
        character: 70
      }
    });

    progressReporterSpy.countFor('report').should.be.equal(2);
  });
}

function buildCoverageInfoCollectorAndSpiesForProgressReportAndOutputChannel() {
  const progressReporterSpy = Imports.Fakes.Adapters.vscode.buildSpyOfProgressReporter(Imports.Fakes.Adapters.vscode.buildFakeProgressReporter());
  const progressReporter = progressReporterSpy.object;
  const outputChannelSpy = Imports.Fakes.Adapters.vscode.buildSpyOfOutputChannel(Imports.Fakes.Adapters.vscode.buildFakeOutputChannel());
  const outputChannel = outputChannelSpy.object;
  const globSearch = Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForExactlyOneMatch();
  const settings = buildSettings();

  const coverageInfoCollector = Imports.Domain.Implementations.CoverageInfoCollector.make({
    coverageInfoFileResolver: Imports.Domain.Implementations.CoverageInfoFileResolver.make({
      outputChannel,
      globSearch,
      progressReporter,
      settings
    }),
    createReadStream: Imports.Fakes.Adapters.FileSystem.buildFakeStreamBuilder(Imports.Fakes.Adapters.FileSystem.buildValidLlvmCoverageJsonObjectStream),
    progressReporter: progressReporterSpy.object,
    outputChannel
  });

  return {
    coverageInfoCollector,
    progressReporterSpy,
    outputChannelSpy
  };
}

function buildCoverageInfoCollectorsAndOutputChannelSpiesUsingStreamFactories(streamFactories: ReadonlyArray<StreamFactory>) {
  return streamFactories.map(streamFfactory => {
    const outputChannelSpy = Imports.Fakes.Adapters.vscode.buildSpyOfOutputChannel(Imports.Fakes.Adapters.vscode.buildFakeOutputChannel());
    const outputChannel = outputChannelSpy.object;
    const globSearch = Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForExactlyOneMatch();
    const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();
    const settings = buildSettings();

    const coverageInfoCollector = Imports.Domain.Implementations.CoverageInfoCollector.make({
      coverageInfoFileResolver: Imports.Domain.Implementations.CoverageInfoFileResolver.make({
        outputChannel,
        globSearch,
        progressReporter,
        settings
      }),
      createReadStream: Imports.Fakes.Adapters.FileSystem.buildFakeStreamBuilder(streamFfactory),
      progressReporter: Imports.Fakes.Adapters.vscode.buildFakeProgressReporter(),
      outputChannel
    });

    return {
      coverageInfoCollector,
      outputChannelSpy
    };
  });
}

type StreamFactory = () => Readable;

function buildSettings() {
  return Imports.Domain.Implementations.SettingsProvider.make({
    outputChannel: Imports.Fakes.Adapters.vscode.buildFakeOutputChannel(),
    workspace: Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings()
  }).settings;
}
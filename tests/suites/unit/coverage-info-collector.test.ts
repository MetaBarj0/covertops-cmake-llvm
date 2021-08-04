import * as chai from "chai";
import { describe, it } from "mocha";
import * as chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
chai.should();

import * as Types from "./types";

import * as VscodeFakes from "../../fakes/adapters/vscode";
import * as FileSystemFakes from "../../fakes/adapters/file-system";
import * as CoverageInfoFileResolver from "../../../src/modules/implementations/coverage-info-file-resolver/coverage-info-file-resolver";
import * as CoverageInfoCollector from "../../../src/modules/implementations/coverage-info-collector/coverage-info-collector";
import * as Definitions from "../../../src/definitions";

import { buildCoverageInfoCollectorAndSpiesForProgressReportAndOutputChannel } from "../../builders/coverage-info-collector";
import { buildSettings } from "../../builders/settings";

import { Readable } from "stream";

describe("Unit test suite", () => {
  describe("the coverage info collector behavior", () => {
    describe("with invalid input readable streams", () => {
      describe("collect coverage info summary", shouldFailToCollectCoverageInfoSummaryBecauseOfInvalidStream);
      describe("collect uncovered region coverage info", shouldFailToCollectUncoveredRegionsBecauseOfInvalidStream);
    });
    describe("with a valid input readable stream", () => {
      describe("for an unhandled source file", () => {
        describe("collect coverage info summary", shouldFailToCollectCoverageInfoSummaryBecauseOfUnhandledSourceFile);
        describe("collect uncovered region coverage info", shouldFailToCollectUncoveredRegionsBecauseOfUnhandledSourceFile);
      });
      describe("for a handled source file", () => {
        describe("collect coverage info summary", shouldSucceedToCollectCoverageInfoSummary);
        describe("collect uncovered region coverage info", shouldSucceedToCollectUncoveredRegions);
      });
    });
  });
});

function shouldFailToCollectCoverageInfoSummaryBecauseOfInvalidStream() {
  const collectorsAndOutputChannelSpies = buildCoverageInfoCollectorsAndOutputChannelSpiesUsingStreamFactories([
    FileSystemFakes.buildEmptyReadableStream,
    FileSystemFakes.buildInvalidLlvmCoverageJsonObjectStream,
    FileSystemFakes.buildNotJsonStream
  ]);

  collectorsAndOutputChannelSpies.forEach(async collectorAndOutputChannelSpy => {
    it("should fail to access to coverage info summary and report to output channel", async () => {
      const collector = collectorAndOutputChannelSpy.coverageInfoCollector;
      const outputChannelSpy = collectorAndOutputChannelSpy.outputChannelSpy;

      const coverageInfo = await collector.collectFor("a");

      return coverageInfo.summary
        .catch((error: Error) => error)
        .then((error: unknown) => {
          (<Error>error).message.should.contain("Invalid coverage information file have been found in the build tree directory. " +
            "Coverage information file must contain llvm coverage report in json format. " +
            "Ensure that both " +
            `'${Definitions.extensionNameInSettings}: Build Tree Directory' and ` +
            `'${Definitions.extensionNameInSettings}: Coverage Info File Name' ` +
            "settings are correctly set.");

          outputChannelSpy.countFor("appendLine").should.be.equal(1);
        });
    });
  });
}

function shouldFailToCollectUncoveredRegionsBecauseOfInvalidStream() {
  const collectorsAndOutputChannelSpies = buildCoverageInfoCollectorsAndOutputChannelSpiesUsingStreamFactories([
    FileSystemFakes.buildEmptyReadableStream,
    FileSystemFakes.buildInvalidLlvmCoverageJsonObjectStream,
    FileSystemFakes.buildNotJsonStream
  ]);

  collectorsAndOutputChannelSpies.forEach(async collectorAndOutputChannelSpy => {
    it("should fail to access to uncovered regions and report in output channel", async () => {
      const collector = collectorAndOutputChannelSpy.coverageInfoCollector;
      const outputChannelSpy = collectorAndOutputChannelSpy.outputChannelSpy;

      const coverageInfo = await collector.collectFor("a");
      const iterateOnUncoveredRegions = async () => { for await (const _region of coverageInfo.uncoveredRegions); };

      return iterateOnUncoveredRegions()
        .catch((error: Error) => error)
        .then(error => {
          (<Error>error).message.should.contain("Invalid coverage information file have been found in the build tree directory. " +
            "Coverage information file must contain llvm coverage report in json format. " +
            "Ensure that both " +
            `'${Definitions.extensionNameInSettings}: Build Tree Directory' and ` +
            `'${Definitions.extensionNameInSettings}: Coverage Info File Name' ` +
            "settings are correctly set.");

          outputChannelSpy.countFor("appendLine").should.be.equal(1);
        });
    });
  });
}

function shouldFailToCollectCoverageInfoSummaryBecauseOfUnhandledSourceFile() {
  it("should fail to provide coverage summary for an unhandled source file and report to output channel", async () => {
    const collectorAndSpies = buildCoverageInfoCollectorAndSpiesForProgressReportAndOutputChannel();
    const collector = collectorAndSpies.coverageInfoCollector;
    const outputChannelSpy = collectorAndSpies.outputChannelSpy;

    const sourceFilePath = "/an/unhandled/source/file.cpp";

    const coverageInfo = await collector.collectFor(sourceFilePath);

    return coverageInfo.summary
      .catch((error: Error) => error)
      .then((error: unknown) => {
        (<Error>error).message.should.contain("Cannot find any summary coverage info for the file " +
          `${sourceFilePath}. Ensure this source file is covered by a test in your project.`);

        outputChannelSpy.countFor("appendLine").should.be.equal(1);
      });
  });
}

function shouldFailToCollectUncoveredRegionsBecauseOfUnhandledSourceFile() {
  it("should fail to provide uncovered code regions for an unhandled source file", async () => {
    const collectorAndSpies = buildCoverageInfoCollectorAndSpiesForProgressReportAndOutputChannel();
    const collector = collectorAndSpies.coverageInfoCollector;
    const outputChannelSpy = collectorAndSpies.outputChannelSpy;

    const sourceFilePath = "/an/unhandled/source/file.cpp";
    const coverageInfo = await collector.collectFor(sourceFilePath);
    const iterateOnUncoveredRegions = async () => { for await (const _region of coverageInfo.uncoveredRegions); };

    await iterateOnUncoveredRegions();

    outputChannelSpy.countFor("appendLine").should.be.equal(1);
  });
}

function shouldSucceedToCollectCoverageInfoSummary() {
  it("should succeed in provided summary coverage info for handled source file in 2 discrete steps", async () => {

    const collectorAndSpies = buildCoverageInfoCollectorAndSpiesForProgressReportAndOutputChannel();
    const collector = collectorAndSpies.coverageInfoCollector;
    const progressReporterSpy = collectorAndSpies.progressReporterSpy;

    const coverageInfo = await collector.collectFor("/a/source/file.cpp");

    const summary = await coverageInfo.summary;

    summary.count.should.be.equal(2);
    summary.covered.should.be.equal(2);
    summary.notCovered.should.be.equal(0);
    summary.percent.should.be.equal(100);

    progressReporterSpy.countFor("report").should.be.equal(2);
  });
}

function shouldSucceedToCollectUncoveredRegions() {
  it("should succeed to provide uncovered regions for a handled source file in 2 discrete steps", async () => {

    const collectorAndSpies = buildCoverageInfoCollectorAndSpiesForProgressReportAndOutputChannel();
    const collector = collectorAndSpies.coverageInfoCollector;
    const progressReporterSpy = collectorAndSpies.progressReporterSpy;

    const coverageInfo = await collector.collectFor("/a/source/file.cpp");
    const regions = coverageInfo.uncoveredRegions;

    const uncoveredRegions: Array<Types.Modules.RegionCoverageInfo> = [];

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

    progressReporterSpy.countFor("report").should.be.equal(2);
  });
}

function buildCoverageInfoCollectorsAndOutputChannelSpiesUsingStreamFactories(streamFactories: ReadonlyArray<StreamFactory>) {
  return streamFactories.map(streamFfactory => {
    const outputChannelSpy = VscodeFakes.buildSpyOfOutputChannel(VscodeFakes.buildFakeOutputChannel());
    const outputChannel = outputChannelSpy.object;
    const globSearch = FileSystemFakes.buildFakeGlobSearchForExactlyOneMatch();
    const progressReporter = VscodeFakes.buildFakeProgressReporter();
    const settings = buildSettings();

    const coverageInfoCollector = CoverageInfoCollector.make({
      coverageInfoFileResolver: CoverageInfoFileResolver.make({
        outputChannel,
        globSearch,
        progressReporter,
        settings
      }),
      createReadStream: FileSystemFakes.buildFakeStreamBuilder(streamFfactory),
      progressReporter: VscodeFakes.buildFakeProgressReporter(),
      outputChannel
    });

    return {
      coverageInfoCollector,
      outputChannelSpy
    };
  });
}

type StreamFactory = () => Readable;

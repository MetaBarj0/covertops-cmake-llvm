import * as chai from "chai";
import { describe, it } from "mocha";
import * as chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
chai.should();

import { buildCoverageInfoCollectorAndSpiesForProgressReportAndOutputChannel } from "../../builders/coverage-info-collector";

describe("Non regression suite of tests", () => {
  describe("Querying uncovered code regions on an unhandled source file", shouldNotThrowForUnhandledFileJustReport);
});

function shouldNotThrowForUnhandledFileJustReport() {
  it("should report once for an unhandled source file without throwing", async () => {
    const collectorAndSpies = buildCoverageInfoCollectorAndSpiesForProgressReportAndOutputChannel();
    const collector = collectorAndSpies.coverageInfoCollector;
    const outputChannelSpy = collectorAndSpies.outputChannelSpy;

    const sourceFilePath = "/an/unhandled/source/file.cpp";
    const coverageInfo = await collector.collectFor(sourceFilePath);
    const iterateOnUncoveredRegions = async () => { for await (const _region of coverageInfo.uncoveredRegions); };

    // TODO: eslint semicolon consistency
    await iterateOnUncoveredRegions().should.not.eventually.be.rejected;

    outputChannelSpy.countFor("appendLine").should.be.equal(1);
  });
}

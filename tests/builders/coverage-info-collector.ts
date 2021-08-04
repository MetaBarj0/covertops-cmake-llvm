import { buildSettings } from "./settings";

import * as VscodeFakes from "../fakes/adapters/vscode";
import * as FileSystemFakes from "../fakes/adapters/file-system";
import * as CoverageInfoFileResolver from "../../src/modules/implementations/coverage-info-file-resolver/coverage-info-file-resolver";
import * as CoverageInfoCollector from "../../src/modules/implementations/coverage-info-collector/coverage-info-collector";

export function buildCoverageInfoCollectorAndSpiesForProgressReportAndOutputChannel(): CoverageInfoCollectorAndSpies {
  const progressReporterSpy = VscodeFakes.buildSpyOfProgressReporter(VscodeFakes.buildFakeProgressReporter());
  const progressReporter = progressReporterSpy.object;
  const outputChannelSpy = VscodeFakes.buildSpyOfOutputChannel(VscodeFakes.buildFakeOutputChannel());
  const outputChannel = outputChannelSpy.object;
  const globSearch = FileSystemFakes.buildFakeGlobSearchForExactlyOneMatch();
  const settings = buildSettings();

  const coverageInfoCollector = CoverageInfoCollector.make({
    coverageInfoFileResolver: CoverageInfoFileResolver.make({
      outputChannel,
      globSearch,
      progressReporter,
      settings
    }),
    createReadStream: FileSystemFakes.buildFakeStreamBuilder(FileSystemFakes.buildValidLlvmCoverageJsonObjectStream),
    progressReporter: progressReporterSpy.object,
    outputChannel
  });

  return {
    coverageInfoCollector,
    progressReporterSpy,
    outputChannelSpy
  };
}

type CoverageInfoCollectorAndSpies = {
  coverageInfoCollector: ReturnType<typeof CoverageInfoCollector.make>,
  progressReporterSpy: ReturnType<typeof VscodeFakes.buildSpyOfProgressReporter>,
  outputChannelSpy: ReturnType<typeof VscodeFakes.buildSpyOfOutputChannel>
};

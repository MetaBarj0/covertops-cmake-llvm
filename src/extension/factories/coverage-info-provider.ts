import * as vscode from "vscode";

// TODO: imports? declarations? types?
import * as SettingsProvider from "../../modules/settings-provider/implementations/settings-provider";
import * as BuildTreeDirectoryResolver from "../../modules/build-tree-directory-resolver/implementations/build-tree-directory-resolver";
import * as Cmake from "../../modules/cmake/implementations/cmake";
import * as CoverageInfoFileResolver from "../../modules/coverage-info-file-resolver/implementations/coverage-info-file-resolver";
import * as CoverageInfoCollector from "../../modules/coverage-info-collector/implementations/coverage-info-collector";
import * as CoverageInfoProviderImplementations from "../../modules/coverage-info-provider/implementations/coverage-info-provider";
import { CoverageInfoProvider } from "../../modules/coverage-info-provider/abstractions/coverage-info-provider";
import * as fileSystem from "../../adapters/implementations/file-system";
import * as processControl from "../../adapters/implementations/process-control";
import * as VscodeAbstractions from "../../adapters/abstractions/vscode";

export function make(context: Context): CoverageInfoProvider {
  const workspace = vscode.workspace;
  const { outputChannel, progressReporter } = context;

  const settings = SettingsProvider.make({ workspace, outputChannel }).settings;
  const buildTreeDirectoryResolver = BuildTreeDirectoryResolver.make({
    outputChannel,
    progressReporter,
    settings,
    mkdir: fileSystem.mkdir,
    stat: fileSystem.stat
  });
  const cmake = Cmake.make({
    settings,
    execFile: processControl.execFile,
    outputChannel,
    progressReporter
  });
  const coverageInfoFileResolver = CoverageInfoFileResolver.make({
    outputChannel,
    globSearch: fileSystem.globSearch,
    progressReporter,
    settings
  });
  const coverageInfoCollector = CoverageInfoCollector.make({
    coverageInfoFileResolver,
    progressReporter,
    outputChannel,
    createReadStream: fileSystem.createReadStream
  });

  return CoverageInfoProviderImplementations.make({
    settings,
    buildTreeDirectoryResolver,
    cmake,
    coverageInfoCollector
  });
}

type Context = {
  progressReporter: VscodeAbstractions.ProgressLike,
  outputChannel: VscodeAbstractions.OutputChannelLike
};

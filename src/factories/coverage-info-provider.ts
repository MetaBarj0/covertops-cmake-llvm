import * as Types from "../types";

import * as SettingsProvider from "../modules/implementations/settings-provider/settings-provider";
import * as BuildTreeDirectoryResolver from "../modules/implementations/build-tree-directory-resolver/build-tree-directory-resolver";
import * as Cmake from "../modules/implementations/cmake/cmake";
import * as CoverageInfoFileResolver from "../modules/implementations/coverage-info-file-resolver/coverage-info-file-resolver";
import * as CoverageInfoCollector from "../modules/implementations/coverage-info-collector/coverage-info-collector";
import * as CoverageInfoProviderImplementations from "../modules/implementations/coverage-info-provider/coverage-info-provider";
import * as fileSystem from "../adapters/implementations/node/file-system";
import * as processControl from "../adapters/implementations/node/process-control";

import * as vscode from "vscode";

export function make(context: Context): Types.Modules.CoverageInfoProvider.CoverageInfoProvider {
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
  progressReporter: Types.Adapters.Vscode.ProgressLike,
  outputChannel: Types.Adapters.Vscode.OutputChannelLikeWithLines
};

import * as Types from "../types";

import * as SettingsProvider from "../../modules/implementations/settings-provider";
import * as BuildTreeDirectoryResolver from "../../modules/implementations/build-tree-directory-resolver";
import * as Cmake from "../../modules/implementations/cmake";
import * as CoverageInfoFileResolver from "../../modules/implementations/coverage-info-file-resolver";
import * as CoverageInfoCollector from "../../modules/implementations/coverage-info-collector";
import * as CoverageInfoProviderImplementations from "../../modules/implementations/coverage-info-provider";
import * as fileSystem from "../../adapters/implementations/file-system";
import * as processControl from "../../adapters/implementations/process-control";

import * as vscode from "vscode";

export function make(context: Context): Types.Modules.CoverageInfoProvider {
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
  progressReporter: Types.Adapters.Abstractions.vscode.ProgressLike,
  outputChannel: Types.Adapters.Abstractions.vscode.OutputChannelLike
};

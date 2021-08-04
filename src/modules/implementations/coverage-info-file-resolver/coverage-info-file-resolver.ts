import * as Types from "../../../types";

import * as Strings from "../../../strings";

import * as path from "path";

export function make(context: Context): Types.Modules.CoverageInfoFileResolver.CoverageInfoFileResolver {
  return new CoverageInfoFileResolver(context);
}

type Context = {
  settings: Types.Modules.SettingsProvider.Settings,
  globSearch: Types.Adapters.Node.GlobSearchCallable,
  progressReporter: Types.Adapters.Vscode.ProgressLike,
  outputChannel: Types.Adapters.Vscode.OutputChannelLike
};

class CoverageInfoFileResolver implements Types.Modules.CoverageInfoFileResolver.CoverageInfoFileResolver {
  constructor(context: Context) {
    this.globSearch = context.globSearch;
    this.settings = context.settings;
    this.progressReporter = context.progressReporter;
    this.outputChannel = context.outputChannel;
  }

  async resolveCoverageInfoFileFullPath() {
    const searchResult = await this.globSearch(this.pattern);

    this.failsIfNoFileIsFound(searchResult);
    this.failsIfManyFilesAreFound(searchResult);

    this.progressReporter.report({
      message: Strings.progressResolvedLLVMFile
    });

    return searchResult[0];
  }

  private failsIfManyFilesAreFound(searchResult: readonly string[]) {
    if (searchResult.length === 1)
      return;

    const errorMessage = Strings.errorSeveralMatchForCoverageInfoFile;

    this.outputChannel.appendLine(errorMessage);

    throw new Error(errorMessage);
  }

  private failsIfNoFileIsFound(searchResult: readonly string[]) {
    if (searchResult.length !== 0)
      return;

    const errorMessage = Strings.errorNoMatchForCoverageInfoFile;

    this.outputChannel.appendLine(errorMessage);

    throw new Error(errorMessage);
  }

  private get pattern() {
    const posixRootPath = this.settings.rootDirectory.split(path.sep).join(path.posix.sep);

    return `${posixRootPath}${path.posix.sep}**${path.posix.sep}${this.settings.coverageInfoFileName}`;
  }

  private readonly globSearch: Types.Adapters.Node.GlobSearchCallable;
  private readonly settings: Types.Modules.SettingsProvider.Settings;
  private readonly progressReporter: Types.Adapters.Vscode.ProgressLike;
  private readonly outputChannel: Types.Adapters.Vscode.OutputChannelLike;
}

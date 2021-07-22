import * as Types from "./types";

import * as Definitions from "../../extension/implementations/definitions";

import * as path from "path";

export function make(context: Context): Types.Modules.Abstractions.CoverageInfoFileResolver {
  return new CoverageInfoFileResolver(context);
}

type Context = {
  settings: Types.Modules.Abstractions.Settings,
  globSearch: Types.Adapters.Abstractions.fileSystem.GlobSearchCallable,
  progressReporter: Types.Adapters.Abstractions.vscode.ProgressLike,
  outputChannel: Types.Adapters.Abstractions.vscode.OutputChannelLike
};

class CoverageInfoFileResolver implements Types.Modules.Abstractions.CoverageInfoFileResolver {
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
      message: "Resolved the LLVM coverage information file path."
    });

    return searchResult[0];
  }

  private failsIfManyFilesAreFound(searchResult: readonly string[]) {
    if (searchResult.length === 1)
      return;

    const errorMessage = "More than one coverage information file have been found in the build tree directory. " +
      "Ensure that both " +
      `'${Definitions.extensionNameInSettings}: Build Tree Directory' and ` +
      `'${Definitions.extensionNameInSettings}: Coverage Info File Name' ` +
      "settings are correctly set.";

    this.outputChannel.appendLine(errorMessage);

    throw new Error(errorMessage);
  }

  private failsIfNoFileIsFound(searchResult: readonly string[]) {
    if (searchResult.length !== 0)
      return;

    const errorMessage = "Cannot resolve the coverage info file path in the build tree directory. " +
      "Ensure that both " +
      `'${Definitions.extensionNameInSettings}: Build Tree Directory' and ` +
      `'${Definitions.extensionNameInSettings}: Coverage Info File Name' ` +
      "settings are correctly set.";

    this.outputChannel.appendLine(errorMessage);

    throw new Error(errorMessage);
  }

  private get pattern() {
    const posixRootPath = this.settings.rootDirectory.split(path.sep).join(path.posix.sep);

    return `${posixRootPath}${path.posix.sep}**${path.posix.sep}${this.settings.coverageInfoFileName}`;
  }

  private readonly globSearch: Types.Adapters.Abstractions.fileSystem.GlobSearchCallable;
  private readonly settings: Types.Modules.Abstractions.Settings;
  private readonly progressReporter: Types.Adapters.Abstractions.vscode.ProgressLike;
  private readonly outputChannel: Types.Adapters.Abstractions.vscode.OutputChannelLike;
}

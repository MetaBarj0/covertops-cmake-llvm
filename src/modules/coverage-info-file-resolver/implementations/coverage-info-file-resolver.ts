import * as Imports from "../imports";

import * as path from "path";

export function make(context: Context): Imports.Domain.Abstractions.CoverageInfoFileResolver {
  return new CoverageInfoFileResolver(context);
}

type Context = {
  settings: Imports.Domain.Abstractions.Settings,
  globSearch: Imports.Adapters.Abstractions.fileSystem.GlobSearchCallable,
  progressReporter: Imports.Adapters.Abstractions.vscode.ProgressLike,
  outputChannel: Imports.Adapters.Abstractions.vscode.OutputChannelLike
};

class CoverageInfoFileResolver implements Imports.Domain.Abstractions.CoverageInfoFileResolver {
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
      `'${Imports.Extension.Definitions.extensionNameInSettings}: Build Tree Directory' and ` +
      `'${Imports.Extension.Definitions.extensionNameInSettings}: Coverage Info File Name' ` +
      "settings are correctly set.";

    this.outputChannel.appendLine(errorMessage);

    throw new Error(errorMessage);
  }

  private failsIfNoFileIsFound(searchResult: readonly string[]) {
    if (searchResult.length !== 0)
      return;

    const errorMessage = "Cannot resolve the coverage info file path in the build tree directory. " +
      "Ensure that both " +
      `'${Imports.Extension.Definitions.extensionNameInSettings}: Build Tree Directory' and ` +
      `'${Imports.Extension.Definitions.extensionNameInSettings}: Coverage Info File Name' ` +
      "settings are correctly set.";

    this.outputChannel.appendLine(errorMessage);

    throw new Error(errorMessage);
  }

  private get pattern() {
    const posixRootPath = this.settings.rootDirectory.split(path.sep).join(path.posix.sep);

    return `${posixRootPath}${path.posix.sep}**${path.posix.sep}${this.settings.coverageInfoFileName}`;
  }

  private readonly globSearch: Imports.Adapters.Abstractions.fileSystem.GlobSearchCallable;
  private readonly settings: Imports.Domain.Abstractions.Settings;
  private readonly progressReporter: Imports.Adapters.Abstractions.vscode.ProgressLike;
  private readonly outputChannel: Imports.Adapters.Abstractions.vscode.OutputChannelLike;
};

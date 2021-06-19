import * as definitions from '../../../definitions';
import * as SettingsProvider from './settings-provider';
import * as ProgressReporter from './progress-reporter';
import * as ErrorChannel from './error-channel';

import path = require('path');

export type GlobSearchLike = {
  search(pattern: string): Promise<ReadonlyArray<string>>;
};

export function make(adapters: Adapters) {
  return new CoverageInfoFileResolver(adapters);
}

type Adapters = {
  workspace: SettingsProvider.VscodeWorkspaceLike,
  globSearch: GlobSearchLike,
  progressReporter: ProgressReporter.ProgressLike,
  errorChannel: ErrorChannel.OutputChannelLike
};

class CoverageInfoFileResolver {
  constructor(adapters: Adapters) {
    this.globSearch = adapters.globSearch;
    this.workspace = adapters.workspace;
    this.progressReporter = adapters.progressReporter;
    this.errorChannel = adapters.errorChannel;
  }

  async resolveCoverageInfoFileFullPath() {
    const searchResult = await this.globSearch.search(this.pattern);

    this.failsIfNoFileIsFound(searchResult);
    this.failsIfManyFilesAreFound(searchResult);

    this.progressReporter.report({
      message: 'Resolved the LLVM coverage information file path.',
      increment: 100 / 6 * 5
    });

    return searchResult[0];
  }

  private failsIfManyFilesAreFound(searchResult: readonly string[]) {
    if (searchResult.length === 1)
      return;

    const errorMessage = 'More than one coverage information file have been found in the build tree directory. ' +
      'Ensure that both ' +
      `'${definitions.extensionNameInSettings}: Build Tree Directory' and ` +
      `'${definitions.extensionNameInSettings}: Coverage Info File Name' ` +
      'settings are correctly set.';

    this.errorChannel.appendLine(errorMessage);

    throw new Error(errorMessage);
  }

  private failsIfNoFileIsFound(searchResult: readonly string[]) {
    if (searchResult.length !== 0)
      return;

    const errorMessage = 'Cannot resolve the coverage info file path in the build tree directory. ' +
      'Ensure that both ' +
      `'${definitions.extensionNameInSettings}: Build Tree Directory' and ` +
      `'${definitions.extensionNameInSettings}: Coverage Info File Name' ` +
      'settings are correctly set.';

    this.errorChannel.appendLine(errorMessage);

    throw new Error(errorMessage);
  }

  private get pattern() {
    const settings = SettingsProvider.make(this.workspace).settings;
    const posixRootPath = settings.rootDirectory.split(path.sep).join(path.posix.sep);

    return `${posixRootPath}${path.posix.sep}**${path.posix.sep}${settings.coverageInfoFileName}`;
  }

  private readonly globSearch: GlobSearchLike;
  private readonly workspace: SettingsProvider.VscodeWorkspaceLike;
  private readonly progressReporter: ProgressReporter.ProgressLike;
  private readonly errorChannel: ErrorChannel.OutputChannelLike;
};

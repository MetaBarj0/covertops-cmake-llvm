import * as definitions from '../../../definitions';
import * as SettingsProvider from './settings-provider';
import * as ProgressReporter from './progress-reporter';
// TODO: use module import syntax???
import { OutputChannelLike, VscodeWorkspaceLike } from '../../../adapters/interfaces/vscode';
import { GlobSearchCallable } from '../../../adapters/interfaces/file-system';

import * as path from 'path';

export function make(adapters: Adapters) {
  return new CoverageInfoFileResolver(adapters);
}

type Adapters = {
  workspace: VscodeWorkspaceLike,
  globSearch: GlobSearchCallable,
  progressReporter: ProgressReporter.ProgressLike,
  errorChannel: OutputChannelLike
};

class CoverageInfoFileResolver {
  constructor(adapters: Adapters) {
    this.globSearch = adapters.globSearch;
    this.workspace = adapters.workspace;
    this.progressReporter = adapters.progressReporter;
    this.errorChannel = adapters.errorChannel;
  }

  async resolveCoverageInfoFileFullPath() {
    const searchResult = await this.globSearch(this.pattern);

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
    const settings = SettingsProvider.make({ workspace: this.workspace, errorChannel: this.errorChannel }).settings;
    const posixRootPath = settings.rootDirectory.split(path.sep).join(path.posix.sep);

    return `${posixRootPath}${path.posix.sep}**${path.posix.sep}${settings.coverageInfoFileName}`;
  }

  private readonly globSearch: GlobSearchCallable;
  private readonly workspace: VscodeWorkspaceLike;
  private readonly progressReporter: ProgressReporter.ProgressLike;
  private readonly errorChannel: OutputChannelLike;
};

import * as definitions from '../../../definitions';
import * as SettingsProvider from './settings-provider';
import { SettingsContract } from '../../interfaces/settings-contract';
// TODO: use module import syntax???
import { OutputChannelLike, ProgressLike, VscodeWorkspaceLike } from '../../../adapters/interfaces/vscode';
import { GlobSearchCallable } from '../../../adapters/interfaces/file-system';

import * as path from 'path';

export function make(adapters: Adapters) {
  return new CoverageInfoFileResolver(adapters);
}

type Adapters = {
  settings: SettingsContract,
  globSearch: GlobSearchCallable,
  progressReporter: ProgressLike,
  errorChannel: OutputChannelLike
};

class CoverageInfoFileResolver {
  constructor(adapters: Adapters) {
    this.globSearch = adapters.globSearch;
    this.settings = adapters.settings;
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
    const posixRootPath = this.settings.rootDirectory.split(path.sep).join(path.posix.sep);

    return `${posixRootPath}${path.posix.sep}**${path.posix.sep}${this.settings.coverageInfoFileName}`;
  }

  private readonly globSearch: GlobSearchCallable;
  private readonly settings: SettingsContract;
  private readonly progressReporter: ProgressLike;
  private readonly errorChannel: OutputChannelLike;
};

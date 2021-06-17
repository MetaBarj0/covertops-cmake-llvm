import * as definitions from '../../../definitions';
import * as SettingsProvider from './settings-provider';
import * as ProgressReporter from './progress-reporter';

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
  progressReporter: ProgressReporter.ProgressLike
};

class CoverageInfoFileResolver {
  constructor(adapters: Adapters) {
    this.globSearch = adapters.globSearch;
    this.workspace = adapters.workspace;
    this.progressReporter = adapters.progressReporter;
  }

  async resolveCoverageInfoFileFullPath() {
    const searchResult = await this.globSearch.search(this.pattern);

    if (searchResult.length === 0)
      throw new Error('Cannot resolve the coverage info file path in the build tree directory. ' +
        'Ensure that both ' +
        `'${definitions.extensionNameInSettings}: Build Tree Directory' and ` +
        `'${definitions.extensionNameInSettings}: Coverage Info File Name' ` +
        'settings are correctly set.');

    if (searchResult.length > 1)
      throw new Error(
        'More than one coverage information file have been found in the build tree directory. ' +
        'Ensure that both ' +
        `'${definitions.extensionNameInSettings}: Build Tree Directory' and ` +
        `'${definitions.extensionNameInSettings}: Coverage Info File Name' ` +
        'settings are correctly set.');

    this.progressReporter.report({});

    return searchResult[0];
  }

  private get pattern() {
    const settings = SettingsProvider.make(this.workspace).settings;
    const posixRootPath = settings.rootDirectory.split(path.sep).join(path.posix.sep);

    return `${posixRootPath}${path.posix.sep}**${path.posix.sep}${settings.coverageInfoFileName}`;
  }

  private readonly globSearch: GlobSearchLike;
  private readonly workspace: SettingsProvider.VscodeWorkspaceLike;
  private readonly progressReporter: ProgressReporter.ProgressLike;
};

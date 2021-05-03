import path = require('path');
import { SettingsProvider, VscodeWorkspaceLike } from './settings-provider';

export type GlobSearchLike = {

  search(pattern: string): Promise<ReadonlyArray<string>>;
};

export class CoverageInfoFileResolver {
  constructor(workspace: VscodeWorkspaceLike, globSearch: GlobSearchLike) {
    this.globSearch = globSearch;
    this.workspace = workspace;
  }

  async resolveCoverageInfoFileFullPath(): Promise<void> {
    const searchResult = await this.globSearch.search(this.pattern);

    if (searchResult.length === 0)
      return Promise.reject(
        'Cannot resolve the coverage info file path in the build tree directory. ' +
        'Ensure that both ' +
        "'cmake-llvm-coverage: Build Tree Directory' and 'cmake-llvm-coverage: Coverage Info File Name' " +
        'settings are correctly set.');

    if (searchResult.length > 1)
      return Promise.reject(
        'More than one coverage information file have been found. ' +
        'Ensure that both ' +
        "'cmake-llvm-coverage: Build Tree Directory' and 'cmake-llvm-coverage: Coverage Info File Name' " +
        'settings are correctly set.');
  }

  private get pattern() {
    const settings = new SettingsProvider(this.workspace).settings;
    const posixRootPath = settings.rootDirectory.split(path.sep).join(path.posix.sep);

    return `${posixRootPath}${path.posix.sep}**${path.posix.sep}${settings.coverageInfoFileName}`;
  }

  private readonly globSearch: GlobSearchLike;
  private readonly workspace: VscodeWorkspaceLike;
};

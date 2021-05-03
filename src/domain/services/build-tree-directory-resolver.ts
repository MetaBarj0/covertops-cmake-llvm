import { BigIntStats, PathLike, StatOptions, Stats } from 'fs';
import * as path from 'path';
import { VscodeWorkspaceLike, SettingsProvider } from './settings-provider';

export type StatFileLike = {
  stat(path: PathLike, opts?: StatOptions): Promise<Stats | BigIntStats>
};

export class BuildTreeDirectoryResolver {
  constructor(workspace: VscodeWorkspaceLike, statFile: StatFileLike) {
    this.workspace = workspace;
    this.statFile = statFile;
  }

  async resolveBuildTreeDirectoryAbsolutePath() {
    try {
      await this.statFile.stat(this.constructBuildTreeDirectoryAbsolutePath);
      return Promise.resolve(this.constructBuildTreeDirectoryAbsolutePath);
    } catch (_error) {
      return Promise.reject(
        "Cannot find the build tree directory. Ensure the 'cmake-llvm-coverage: Build Tree Directory' " +
        'setting is correctly set and target to an existing cmake build tree directory.');
    }
  }

  private get constructBuildTreeDirectoryAbsolutePath() {
    const settings = new SettingsProvider(this.workspace).settings;
    return path.resolve(settings.rootDirectory, settings.buildTreeDirectory);
  }

  private statFile: StatFileLike;
  private workspace: VscodeWorkspaceLike;
};

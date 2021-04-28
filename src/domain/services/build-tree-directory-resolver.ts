import { BigIntStats, PathLike, StatOptions, Stats } from 'fs';
import * as path from 'path';
import { Settings } from '../value-objects/settings';

export type StatFileLike = {
  stat(path: PathLike, opts?: StatOptions): Promise<Stats | BigIntStats>
};

export class BuildTreeDirectoryResolver {
  constructor(settings: Settings, statFile: StatFileLike) {
    this.settings = settings;
    this.statFile = statFile;
  }

  async resolveBuildTreeDirectoryRelativePath() {
    try {
      await this.statFile.stat(this.constructBuildTreeDirectoryAbsolutePath);
      return Promise.resolve(this.constructBuildTreeDirectoryAbsolutePath);
    } catch (_error) {
      return Promise.reject(
        "Cannot find the build tree directory. Ensure the 'cmake-llvm-coverage Build Tree Directory' " +
        'setting is correctly set and target to an existing cmake build tree directory.');
    }
  }

  private get constructBuildTreeDirectoryAbsolutePath() {
    return path.join(this.settings.rootDirectory, this.settings.buildTreeDirectory);
  }

  private statFile: StatFileLike;
  private settings: Settings;
};

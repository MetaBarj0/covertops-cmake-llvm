import * as definitions from '../../../definitions';
import * as SettingsProvider from './settings-provider';
import * as ProgressReporter from './progress-reporter';

import { BigIntStats, MakeDirectoryOptions, PathLike, StatOptions, Stats } from 'fs';
import * as path from 'path';

export type StatFileLike = {
  stat(path: PathLike, opts?: StatOptions): Promise<Stats | BigIntStats>
};

export type MkDirLike = {
  mkdir(path: PathLike, options: MakeDirectoryOptions & { recursive: true; }): Promise<string | undefined>
};

export function make(adapters: Adapters) {
  return new BuildTreeDirectoryResolver(adapters);
}

type Adapters = {
  workspace: SettingsProvider.VscodeWorkspaceLike,
  statFile: StatFileLike,
  mkDir: MkDirLike,
  progressReporter: ProgressReporter.ProgressLike
};

class BuildTreeDirectoryResolver {
  constructor(adapters: Adapters) {
    this.workspace = adapters.workspace;
    this.statFile = adapters.statFile;
    this.mkDir = adapters.mkDir;
    this.progressReporter = adapters.progressReporter;
  }

  async resolveAbsolutePath() {
    const buildTreeDirectory = SettingsProvider.make(this.workspace).settings.buildTreeDirectory;

    if (path.isAbsolute(buildTreeDirectory))
      throw new Error(`Incorrect absolute path specified in '${definitions.extensionNameInSettings}: ` +
        "Build Tree Directory'. It must be a relative path.");

    await this.statAndCreateIfNeeded(buildTreeDirectory);

    this.progressReporter.report({
      message: 'Resolved build tree directory path.',
      increment: 100 / 6 * 1
    });
  }

  private async statAndCreateIfNeeded(buildTreeDirectory: string) {
    await this.stat(buildTreeDirectory)
      .catch(async _ => {
        await this.mkDir.mkdir(buildTreeDirectory, { recursive: true })
          .catch(_ => {
            return Promise.reject(
              'Cannot find or create the build tree directory. Ensure the ' +
              `'${definitions.extensionNameInSettings}: Build Tree Directory' setting is a valid relative path.`);
          });
      });
  }

  private async stat(buildTreeDirectory: string) {
    await this.statFile.stat(buildTreeDirectory);
  }

  private readonly statFile: StatFileLike;
  private readonly workspace: SettingsProvider.VscodeWorkspaceLike;
  private readonly mkDir: MkDirLike;
  private readonly progressReporter: ProgressReporter.ProgressLike;
};

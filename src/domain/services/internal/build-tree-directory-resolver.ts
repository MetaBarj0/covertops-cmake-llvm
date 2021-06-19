import * as definitions from '../../../definitions';
import * as SettingsProvider from './settings-provider';
import * as ProgressReporter from './progress-reporter';
import * as ErrorChannel from './error-channel';

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
  progressReporter: ProgressReporter.ProgressLike,
  errorChannel: ErrorChannel.OutputChannelLike
};

class BuildTreeDirectoryResolver {
  constructor(adapters: Adapters) {
    this.workspace = adapters.workspace;
    this.statFile = adapters.statFile;
    this.mkDir = adapters.mkDir;
    this.progressReporter = adapters.progressReporter;
    this.errorChannel = adapters.errorChannel;
  }

  async resolveAbsolutePath() {
    const buildTreeDirectory = SettingsProvider.make(this.workspace).settings.buildTreeDirectory;

    this.ensurePathIsNotAbsolute(buildTreeDirectory);

    await this.statAndCreateIfNeeded(buildTreeDirectory);

    this.progressReporter.report({
      message: 'Resolved build tree directory path.',
      increment: 100 / 6 * 1
    });
  }

  private ensurePathIsNotAbsolute(buildTreeDirectory: string) {
    if (path.isAbsolute(buildTreeDirectory)) {
      const errorMessage = `Incorrect absolute path specified in '${definitions.extensionNameInSettings}: ` +
        "Build Tree Directory'. It must be a relative path.";

      this.errorChannel.appendLine(errorMessage);

      throw new Error(errorMessage);
    }
  }

  private async statAndCreateIfNeeded(buildTreeDirectory: string) {
    await this.stat(buildTreeDirectory)
      .catch(async _ => {
        await this.mkDir.mkdir(buildTreeDirectory, { recursive: true })
          .catch(_ => {
            const errorMessage = 'Cannot find or create the build tree directory. Ensure the ' +
              `'${definitions.extensionNameInSettings}: Build Tree Directory' setting is a valid relative path.`;

            this.errorChannel.appendLine(errorMessage);

            return Promise.reject(new Error(errorMessage));
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
  private readonly errorChannel: ErrorChannel.OutputChannelLike;
};

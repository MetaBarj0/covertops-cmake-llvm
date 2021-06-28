import * as definitions from '../../../definitions';
import * as SettingsProvider from './settings-provider';
import * as ProgressReporter from './progress-reporter';
import * as ErrorChannel from './error-channel';
import { StatFileCallable } from '../../../adapters/interfaces/stat-file-callable';
import { VscodeWorkspaceLike } from '../../../adapters/interfaces/vscode-workspace-like';

import { MakeDirectoryOptions, PathLike, } from 'fs';
import * as path from 'path';

export type MkDirLike = {
  mkdir(path: PathLike, options: MakeDirectoryOptions & { recursive: true; }): Promise<string | undefined>
};

export function make(adapters: Adapters) {
  return new BuildTreeDirectoryResolver(adapters);
}

type Adapters = {
  workspace: VscodeWorkspaceLike,
  statFile: StatFileCallable,
  mkDir: MkDirLike,
  progressReporter: ProgressReporter.ProgressLike,
  errorChannel: ErrorChannel.OutputChannelLike
};

class BuildTreeDirectoryResolver {
  constructor(adapters: Adapters) {
    this.workspace = adapters.workspace;
    this.stat = adapters.statFile;
    this.mkDir = adapters.mkDir;
    this.progressReporter = adapters.progressReporter;
    this.errorChannel = adapters.errorChannel;
  }

  async resolveAbsolutePath() {
    const buildTreeDirectory = SettingsProvider.make({ workspace: this.workspace, errorChannel: this.errorChannel }).settings.buildTreeDirectory;

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

  private readonly stat: StatFileCallable;
  private readonly workspace: VscodeWorkspaceLike;
  private readonly mkDir: MkDirLike;
  private readonly progressReporter: ProgressReporter.ProgressLike;
  private readonly errorChannel: ErrorChannel.OutputChannelLike;
};

import * as definitions from '../../../definitions';
import { MkdirCallable, StatCallable } from '../../../adapters/interfaces/file-system';
import { SettingsContract } from '../../../domain/interfaces/settings-contract';
import { OutputChannelLike, ProgressLike } from '../../../adapters/interfaces/vscode';

import * as Abstractions from '../abstractions/domain/build-tree-directory-resolver';

import * as path from 'path';

export function make(adapters: Adapters): Abstractions.BuildTreeDirectoryResolver {
  return new BuildTreeDirectoryResolver(adapters);
}

type Adapters = {
  settings: SettingsContract,
  stat: StatCallable,
  mkDir: MkdirCallable,
  progressReporter: ProgressLike,
  errorChannel: OutputChannelLike
};

class BuildTreeDirectoryResolver implements Abstractions.BuildTreeDirectoryResolver {
  constructor(adapters: Adapters) {
    this.settings = adapters.settings;
    this.stat = adapters.stat;
    this.mkdir = adapters.mkDir;
    this.progressReporter = adapters.progressReporter;
    this.errorChannel = adapters.errorChannel;
  }

  async resolve() {
    const buildTreeDirectory = this.settings.buildTreeDirectory;

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
        await this.mkdir(buildTreeDirectory, { recursive: true })
          .catch(_ => {
            const errorMessage = 'Cannot find or create the build tree directory. Ensure the ' +
              `'${definitions.extensionNameInSettings}: Build Tree Directory' setting is a valid relative path.`;

            this.errorChannel.appendLine(errorMessage);

            return Promise.reject(new Error(errorMessage));
          });
      });
  }

  private readonly stat: StatCallable;
  private readonly settings: SettingsContract;
  private readonly mkdir: MkdirCallable;
  private readonly progressReporter: ProgressLike;
  private readonly errorChannel: OutputChannelLike;
};

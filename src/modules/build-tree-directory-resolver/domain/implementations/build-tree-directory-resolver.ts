import { MkdirCallable, StatCallable } from '../../../../shared-kernel/abstractions/file-system';
import { OutputChannelLike, ProgressLike } from '../../../../shared-kernel/abstractions/vscode';

import * as Definitions from '../../../../extension/definitions';
import { Settings } from '../../../settings-provider/domain/abstractions/settings';
import * as Abstractions from '../abstractions/build-tree-directory-resolver';

import * as path from 'path';

export function make(adapters: Adapters): Abstractions.BuildTreeDirectoryResolver {
  return new BuildTreeDirectoryResolver(adapters);
}

type Adapters = {
  settings: Settings,
  stat: StatCallable,
  mkdir: MkdirCallable,
  progressReporter: ProgressLike,
  errorChannel: OutputChannelLike
};

class BuildTreeDirectoryResolver implements Abstractions.BuildTreeDirectoryResolver {
  constructor(adapters: Adapters) {
    this.settings = adapters.settings;
    this.stat = adapters.stat;
    this.mkdir = adapters.mkdir;
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
      const errorMessage = `Incorrect absolute path specified in '${Definitions.extensionNameInSettings}: ` +
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
              `'${Definitions.extensionNameInSettings}: Build Tree Directory' setting is a valid relative path.`;

            this.errorChannel.appendLine(errorMessage);

            return Promise.reject(new Error(errorMessage));
          });
      });
  }

  private readonly stat: StatCallable;
  private readonly settings: Settings;
  private readonly mkdir: MkdirCallable;
  private readonly progressReporter: ProgressLike;
  private readonly errorChannel: OutputChannelLike;
};

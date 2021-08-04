import * as Types from "../../types";

import * as Strings from "../../../strings";

import * as path from "path";

export function make(adapters: Adapters): Types.Modules.BuildTreeDirectoryResolver {
  return new BuildTreeDirectoryResolver(adapters);
}

type Adapters = {
  settings: Types.Modules.Settings,
  stat: Types.Adapters.fileSystem.StatCallable,
  mkdir: Types.Adapters.fileSystem.MkdirCallable,
  progressReporter: Types.Adapters.vscode.ProgressLike,
  outputChannel: Types.Adapters.vscode.OutputChannelLike
};

class BuildTreeDirectoryResolver implements Types.Modules.BuildTreeDirectoryResolver {
  constructor(adapters: Adapters) {
    this.settings = adapters.settings;
    this.stat = adapters.stat;
    this.mkdir = adapters.mkdir;
    this.progressReporter = adapters.progressReporter;
    this.outputChannel = adapters.outputChannel;
  }

  async resolve() {
    const buildTreeDirectory = this.settings.buildTreeDirectory;

    this.ensurePathIsNotAbsolute(buildTreeDirectory);

    await this.statAndCreateIfNeeded(buildTreeDirectory);

    this.progressReporter.report({
      message: Strings.progressResolvedBuildTreeDirectory
    });
  }

  private ensurePathIsNotAbsolute(buildTreeDirectory: string) {
    if (path.isAbsolute(buildTreeDirectory)) {
      const errorMessage = Strings.errorBadAbsolutePathForBuildTreeDirectoryWithArg;

      this.outputChannel.appendLine(errorMessage);

      throw new Error(errorMessage);
    }
  }

  private async statAndCreateIfNeeded(buildTreeDirectory: string) {
    await this.stat(buildTreeDirectory).
      catch(async _ => {
        await this.mkdir(buildTreeDirectory, { recursive: true }).
          catch(_ => {
            const errorMessage = Strings.errorCannotStatCreateBuildTreeDirectory;

            this.outputChannel.appendLine(errorMessage);

            return Promise.reject(new Error(errorMessage));
          });
      });
  }

  private readonly stat: Types.Adapters.fileSystem.StatCallable;
  private readonly settings: Types.Modules.Settings;
  private readonly mkdir: Types.Adapters.fileSystem.MkdirCallable;
  private readonly progressReporter: Types.Adapters.vscode.ProgressLike;
  private readonly outputChannel: Types.Adapters.vscode.OutputChannelLike;
}

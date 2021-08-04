import * as Types from "../../../types";

import * as Strings from "../../../strings";

import * as path from "path";

export function make(adapters: Adapters): Types.Modules.BuildTreeDirectoryResolver.BuildTreeDirectoryResolver {
  return new BuildTreeDirectoryResolver(adapters);
}

type Adapters = {
  settings: Types.Modules.SettingsProvider.Settings,
  stat: Types.Adapters.Node.StatCallable,
  mkdir: Types.Adapters.Node.MkdirCallable,
  progressReporter: Types.Adapters.Vscode.ProgressLike,
  outputChannel: Types.Adapters.Vscode.OutputChannelLikeWithLines
};

class BuildTreeDirectoryResolver implements Types.Modules.BuildTreeDirectoryResolver.BuildTreeDirectoryResolver {
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

  private readonly stat: Types.Adapters.Node.StatCallable;
  private readonly settings: Types.Modules.SettingsProvider.Settings;
  private readonly mkdir: Types.Adapters.Node.MkdirCallable;
  private readonly progressReporter: Types.Adapters.Vscode.ProgressLike;
  private readonly outputChannel: Types.Adapters.Vscode.OutputChannelLikeWithLines;
}

import * as Types from "./types";

import * as Definitions from "../../extension/implementations/definitions";

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
      message: "Resolved build tree directory path."
    });
  }

  private ensurePathIsNotAbsolute(buildTreeDirectory: string) {
    if (path.isAbsolute(buildTreeDirectory)) {
      const errorMessage = `Incorrect absolute path specified in '${Definitions.extensionNameInSettings}: ` +
        "Build Tree Directory'. It must be a relative path.";

      this.outputChannel.appendLine(errorMessage);

      throw new Error(errorMessage);
    }
  }

  private async statAndCreateIfNeeded(buildTreeDirectory: string) {
    await this.stat(buildTreeDirectory).
      catch(async _ => {
        await this.mkdir(buildTreeDirectory, { recursive: true }).
          catch(_ => {
            const errorMessage = "Cannot find or create the build tree directory. Ensure the " +
              `'${Definitions.extensionNameInSettings}: Build Tree Directory' setting is a valid relative path.`;

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

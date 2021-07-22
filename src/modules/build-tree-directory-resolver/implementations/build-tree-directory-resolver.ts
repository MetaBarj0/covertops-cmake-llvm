import * as Imports from "../imports";

import * as path from "path";

export function make(adapters: Adapters): Imports.Domain.Abstractions.BuildTreeDirectoryResolver {
  return new BuildTreeDirectoryResolver(adapters);
}

type Adapters = {
  settings: Imports.Domain.Abstractions.Settings,
  stat: Imports.Adapters.Abstractions.fileSystem.StatCallable,
  mkdir: Imports.Adapters.Abstractions.fileSystem.MkdirCallable,
  progressReporter: Imports.Adapters.Abstractions.vscode.ProgressLike,
  outputChannel: Imports.Adapters.Abstractions.vscode.OutputChannelLike
};

class BuildTreeDirectoryResolver implements Imports.Domain.Abstractions.BuildTreeDirectoryResolver {
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
      const errorMessage = `Incorrect absolute path specified in '${Imports.Extension.Definitions.extensionNameInSettings}: ` +
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
              `'${Imports.Extension.Definitions.extensionNameInSettings}: Build Tree Directory' setting is a valid relative path.`;

            this.outputChannel.appendLine(errorMessage);

            return Promise.reject(new Error(errorMessage));
          });
      });
  }

  private readonly stat: Imports.Adapters.Abstractions.fileSystem.StatCallable;
  private readonly settings: Imports.Domain.Abstractions.Settings;
  private readonly mkdir: Imports.Adapters.Abstractions.fileSystem.MkdirCallable;
  private readonly progressReporter: Imports.Adapters.Abstractions.vscode.ProgressLike;
  private readonly outputChannel: Imports.Adapters.Abstractions.vscode.OutputChannelLike;
};

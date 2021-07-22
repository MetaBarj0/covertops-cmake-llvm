import * as Types from "./types";

import * as Definitions from "../../extension/implementations/definitions";

export abstract class BasicCmake implements Types.Modules.Abstractions.Cmake {
  constructor(outputChannel: Types.Adapters.Abstractions.vscode.OutputChannelLike,
    progressReporter: Types.Adapters.Abstractions.vscode.ProgressLike,
    settings: Types.Modules.Abstractions.Settings) {
    this.outputChannel = outputChannel;
    this.progressReporter = progressReporter;
    this.settings = settings;
  }

  async buildTarget(): Promise<void> {
    try {
      await this.reachCommand();

      this.progressReporter.report({
        message: "Found an invocable cmake command."
      });
    } catch (error) {
      return this.handleErrorWithMessage(error,
        `Cannot find the cmake command. Ensure the '${Definitions.extensionNameInSettings}: Cmake Command' ` +
        "setting is correctly set. Have you verified your PATH environment variable?");
    }

    try {
      await this.generateProject();

      this.progressReporter.report({
        message: "Generated the cmake project."
      });
    } catch (error) {
      return this.handleErrorWithMessage(error,
        "Cannot generate the cmake project in the " +
        `${this.settings.rootDirectory} directory. ` +
        "Ensure either you have opened a valid cmake project, or the cmake project has not already been generated using different options. " +
        `You may have to take a look in '${Definitions.extensionNameInSettings}: Additional Cmake Options' settings ` +
        "and check the generator used is correct for instance.");
    }

    try {
      await this.build();

      this.progressReporter.report({
        message: "Built the target."
      });
    } catch (error) {
      return this.handleErrorWithMessage(error,
        `Error: Could not build the specified cmake target ${this.settings.cmakeTarget}. ` +
        `Ensure '${Definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`);
    }
  }

  protected abstract reachCommand(): Thenable<void>;
  protected abstract generateProject(): Thenable<void>;
  protected abstract build(): Thenable<void>;

  protected readonly settings: Types.Modules.Abstractions.Settings;

  private handleErrorWithMessage(error: Error, message: string) {
    const errorMessage = `${message}${(<Error>error).message}`;

    this.outputChannel.appendLine(errorMessage);

    return Promise.reject(new Error(errorMessage));
  }

  private readonly progressReporter: Types.Adapters.Abstractions.vscode.ProgressLike;
  private readonly outputChannel: Types.Adapters.Abstractions.vscode.OutputChannelLike;
}

export function make(context: Context): Types.Modules.Abstractions.Cmake {
  return new Cmake(context);
}

class Cmake extends BasicCmake implements Types.Modules.Abstractions.Cmake {
  constructor(context: Context) {
    super(context.outputChannel, context.progressReporter, context.settings);

    this.execFile = context.execFile;
  }

  protected reachCommand() {
    return this.executeCommandWith({
      arguments: ["--version"]
    });
  }

  protected override generateProject() {
    const build = this.settings.buildTreeDirectory;
    const source = this.settings.rootDirectory;

    return this.executeCommandWith({
      arguments: ["-B", build, "-S", source, ...this.settings.additionalCmakeOptions]
    });
  }

  protected override build() {
    const build = this.settings.buildTreeDirectory;
    const target = this.settings.cmakeTarget;

    return this.executeCommandWith({
      arguments: ["--build", build, "--target", target]
    });
  }

  private executeCommandWith(options: {
    arguments: ReadonlyArray<string>
  }) {
    return new Promise<void>((resolve, reject) => {
      const cmakeCommand = this.settings.cmakeCommand;

      this.execFile(
        cmakeCommand, options.arguments,
        {
          cwd: this.settings.rootDirectory,
          env: process.env
        },
        (error, stdout, stderr) => {
          if (!error)
            return resolve();

          const errorMessage = `\n${error.message}\n${stderr}\n${stdout}`;

          return reject(new Error(errorMessage));
        });
    });
  }

  private readonly execFile: Types.Adapters.Abstractions.processControl.ExecFileCallable;
}

type Context = {
  settings: Types.Modules.Abstractions.Settings,
  progressReporter: Types.Adapters.Abstractions.vscode.ProgressLike,
  outputChannel: Types.Adapters.Abstractions.vscode.OutputChannelLike,
  execFile: Types.Adapters.Abstractions.processControl.ExecFileCallable,
};

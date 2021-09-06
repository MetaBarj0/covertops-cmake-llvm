import * as Types from "../../../types";

import * as Strings from "../../../strings";

export abstract class BasicCmake implements Types.Modules.Cmake.Cmake {
  constructor(outputChannel: Types.Adapters.Vscode.OutputChannelLikeWithLines,
    progressReporter: Types.Adapters.Vscode.ProgressLike,
    settings: Types.Modules.SettingsProvider.Settings) {
    this.outputChannel = outputChannel;
    this.progressReporter = progressReporter;
    this.settings = settings;
  }

  async buildTarget(): Promise<void> {
    try {
      await this.reachCommand();

      this.progressReporter.report({
        message: Strings.progressFoundCMake
      });
    } catch (error) {
      return this.handleErrorWithMessage(<Error>error, Strings.errorUnreachableCmake);
    }

    try {
      await this.generateProject();

      this.progressReporter.report({
        message: Strings.progressGeneratedCmakeProject
      });
    } catch (error) {
      return this.handleErrorWithMessage(<Error>error, Strings.errorWhenGeneratingCmakeProjectLocatedIn(this.settings.rootDirectory));
    }

    try {
      await this.build();

      this.progressReporter.report({
        message: Strings.progressTargetBuilt
      });
    } catch (error) {
      return this.handleErrorWithMessage(<Error>error, Strings.errorWhenBuildingTargetNamed(this.settings.cmakeTarget));
    }
  }

  protected abstract reachCommand(): Thenable<void>;
  protected abstract generateProject(): Thenable<void>;
  protected abstract build(): Thenable<void>;

  protected readonly settings: Types.Modules.SettingsProvider.Settings;

  private handleErrorWithMessage(error: Error, message: string) {
    const errorMessage = `${message}${(<Error>error).message}`;

    this.outputChannel.appendLine(errorMessage);

    return Promise.reject(new Error(errorMessage));
  }

  private readonly progressReporter: Types.Adapters.Vscode.ProgressLike;
  private readonly outputChannel: Types.Adapters.Vscode.OutputChannelLikeWithLines;
}

export function make(context: Context): Types.Modules.Cmake.Cmake {
  return new Cmake(context);
}

class Cmake extends BasicCmake implements Types.Modules.Cmake.Cmake {
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

  private readonly execFile: Types.Adapters.Node.ExecFileCallable;
}

type Context = {
  settings: Types.Modules.SettingsProvider.Settings,
  progressReporter: Types.Adapters.Vscode.ProgressLike,
  outputChannel: Types.Adapters.Vscode.OutputChannelLikeWithLines,
  execFile: Types.Adapters.Node.ExecFileCallable,
};

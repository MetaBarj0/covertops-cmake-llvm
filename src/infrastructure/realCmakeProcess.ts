import { Settings } from "../domain/value-objects/settings";
import { CmakeProcess } from "../domain/ports/cmakeProcess";

import * as cp from 'child_process';

export class RealCmakeProcess implements CmakeProcess {
  constructor(settings: Settings, env?: NodeJS.ProcessEnv) {
    this.settings = settings;
    this.env = env;
  }

  async buildCmakeTarget(): Promise<void> {
    await this.runCmakeWith(
      ['--version'],
      "Cannot find the cmake command. Ensure the 'cmake-llvm-coverage Cmake Command' " +
      'setting is correctly set. Have you verified your PATH environment variable?');

    await this.runCmakeWith([...this.settings.additionalCmakeOptions,
      '-S', this.settings.rootDirectory,
      '-B', this.settings.buildTreeDirectory]);

    await this.runCmakeWith(
      ['--build', 'build', '--target', this.settings.cmakeTarget],
      `Error: Could not build the specified cmake target ${this.settings.cmakeTarget}. ` +
      "Ensure 'cmake-llvm-coverage Cmake Target' setting is properly set.");
  }

  private runCmakeWith(args: Array<string>, rejectMessage?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cp.execFile(
        this.settings.cmakeCommand,
        args,
        { cwd: this.settings.rootDirectory, env: this.env },
        (error, stdout, stderr) => {
          if (error) {
            reject(`${rejectMessage}\n${error.message}\n${stdout}\n${stderr}`);
          }
          else
            resolve();
        });
    });
  }

  private readonly settings: Settings;
  private readonly env?: NodeJS.ProcessEnv;
};

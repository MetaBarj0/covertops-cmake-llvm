import { Settings } from "../records/settings";
import { CmakeProcess } from "../ports/cmakeProcess";

import * as cp from 'child_process';

export class RealCmakeProcess implements CmakeProcess {
  constructor(settings: Settings) {
    this.settings = settings;
  }

  async buildCmakeTarget(): Promise<void> {
    await this.runCmakeWith(
      ['--version'],
      "Cannot find the cmake command. Ensure the 'cmake-llvm-coverage Cmake Command' " +
      'setting is correctly set. Have you verified your PATH environment variable?');

    await this.runCmakeWith(['-DCMAKE_CXX_COMPILER=clang++',
      '-G', 'Ninja', '-S', '.', '-B', 'build']);

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
        { cwd: this.settings.rootDirectory, },
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
};

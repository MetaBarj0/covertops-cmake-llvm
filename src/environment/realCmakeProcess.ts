import { Settings } from "../records/settings";
import { CmakeProcess } from "../adapters/cmakeProcess";

import * as cp from 'child_process';

export class RealCmakeProcess implements CmakeProcess {
  constructor(settings: Settings) {
    this.settings = settings;
  }

  async buildCmakeTarget(): Promise<void> {
    await this.ensureCmakeCommandIsReachable();

    return Promise.reject(
      'Error: Could not build the specified cmake target. ' +
      "Ensure 'cmake-llvm-coverage Cmake Target' setting is properly set.");
  }

  private readonly settings: Settings;

  private ensureCmakeCommandIsReachable(): Promise<void> {
    return new Promise((resolve, reject) => {
      cp.execFile(
        this.settings.cmakeCommand,
        ['--version'],
        { cwd: this.settings.rootDirectory, },
        error => {
          if (error) {
            reject(
              "Cannot find the cmake command. Ensure the 'cmake-llvm-coverage Cmake Command' " +
              'setting is correctly set. Have you verified your PATH environment variable?\n' +
              error.message);
          } else
            resolve();
        });
    });
  }
};

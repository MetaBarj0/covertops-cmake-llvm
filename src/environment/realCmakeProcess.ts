import { Settings } from "../records/settings";
import { CmakeProcess } from "../adapters/cmakeProcess";

export class RealCmakeProcess implements CmakeProcess {
  constructor(settings: Settings) {
    this.settings = settings;
  }

  buildCmakeTarget() {
    return Promise.reject(
      "Cannot find the cmake command. Ensure the 'cmake-llvm-coverage Cmake Command' " +
      'setting is correctly set. Have you verified your PATH environment variable?');
  }

  private readonly settings: Settings;
};

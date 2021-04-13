import { BuildTreeDirectoryResolver } from "../adapters/buildTreeDirectoryResolver";
import { Settings } from "../records/settings";

import { promises as fs } from 'fs';
import * as path from 'path';

export class FileSystemBuildTreeDirectoryResolver implements BuildTreeDirectoryResolver {
  constructor(settings: Settings) {
    this.settings = settings;
  }

  async getFullPath(): Promise<string> {
    return new Promise((resolve, reject) => {
      const directoryPath = this.constructDirectoryPath();

      fs.stat(directoryPath)
        .then(_ => {
          resolve(directoryPath);
        })
        .catch(_ => {
          reject(`Cannot find the ${directoryPath} build tree directory. Ensure the 'cmake-llvm-coverage Build Tree Directory' ` +
            'setting is correctly set and target to an existing cmake build tree directory.');
        });
    });
  }

  private constructDirectoryPath() {
    return `${this.settings.rootDirectory}${path.sep}${this.settings.buildTreeDirectory}`;
  }

  private readonly settings: Settings;
};

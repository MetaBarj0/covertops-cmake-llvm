import { BuildTreeDirectoryResolver } from "../ports/buildTreeDirectoryResolver";
import { Settings } from "../records/settings";

import { promises as fs } from 'fs';
import * as path from 'path';

export class FileSystemBuildTreeDirectoryResolver implements BuildTreeDirectoryResolver {
  constructor(settings: Settings) {
    this.settings = settings;
  }

  async resolveFullPath(): Promise<void> {
    return new Promise((resolve, reject) => {
      const directoryPath = this.constructDirectoryPath();

      fs.stat(directoryPath)
        .then(_ => {
          resolve();
        })
        .catch(_ => {
          reject(`Cannot find the build tree directory. Ensure the 'cmake-llvm-coverage Build Tree Directory' ` +
            'setting is correctly set and target to an existing cmake build tree directory.');
        });
    });
  }

  private constructDirectoryPath() {
    return `${this.settings.rootDirectory}${path.sep}${this.settings.buildTreeDirectory}`;
  }

  private readonly settings: Settings;
};

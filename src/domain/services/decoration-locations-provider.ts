import { VscodeWorkspaceLike } from './settings-provider';
import { StatFileLike, FileOrDirectoryResolver } from './file-or-directory-resolver';
import { Cmake, ProcessLike } from './cmake';
import { Readable } from 'stream';

type Adapters = {
  workspace: VscodeWorkspaceLike,
  statFile: StatFileLike,
  process: ProcessLike,
  inputStream: Readable
};

export class DecorationLocationsProvider {
  constructor(adapters: Adapters) {
    this.workspace = adapters.workspace;
    this.statFile = adapters.statFile;
    this.process = adapters.process;
    this.inputStream = adapters.inputStream;
  }

  async getDecorationLocationsForUncoveredCodeRegions() {
    const buildTreeDirectoryResolver = new FileOrDirectoryResolver(this.workspace, this.statFile);
    await buildTreeDirectoryResolver.resolveBuildTreeDirectoryRelativePath();

    const cmake = new Cmake(this.workspace, this.process);
    await cmake.buildTarget();
  }

  private readonly workspace: VscodeWorkspaceLike;
  private readonly statFile: StatFileLike;
  private readonly process: ProcessLike;
  private readonly inputStream: Readable;
}
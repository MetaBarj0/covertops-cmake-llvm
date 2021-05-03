import { VscodeWorkspaceLike } from './settings-provider';
import { StatFileLike, BuildTreeDirectoryResolver } from './build-tree-directory-resolver';
import { Cmake, ProcessLike } from './cmake';
import { CoverageInfoFileResolver, GlobSearchLike } from './coverage-info-file-resolver';

type Adapters = {
  workspace: VscodeWorkspaceLike,
  statFile: StatFileLike,
  processForCmakeCommand: ProcessLike,
  processForCmakeTarget: ProcessLike,
  globSearch: GlobSearchLike
};

export class DecorationLocationsProvider {
  constructor(adapters: Adapters) {
    this.workspace = adapters.workspace;
    this.statFile = adapters.statFile;
    this.processForCmakeCommand = adapters.processForCmakeCommand;
    this.processForCmakeTarget = adapters.processForCmakeTarget;
    this.globSearch = adapters.globSearch;
  }

  async getDecorationLocationsForUncoveredCodeRegions() {
    const buildTreeDirectoryResolver = new BuildTreeDirectoryResolver(this.workspace, this.statFile);
    await buildTreeDirectoryResolver.resolveBuildTreeDirectoryAbsolutePath();

    const cmake = new Cmake({
      workspace: this.workspace,
      processForCommand: this.processForCmakeCommand,
      processForTarget: this.processForCmakeTarget
    });

    await cmake.buildTarget();

    const coverageInfoFileResolver = new CoverageInfoFileResolver(this.workspace, this.globSearch);
    await coverageInfoFileResolver.resolveCoverageInfoFileFullPath();

    return Promise.reject('getDecorationLocationsForUncoveredCodeRegions implementation is not yet complete.');
  }

  private readonly workspace: VscodeWorkspaceLike;
  private readonly statFile: StatFileLike;
  private readonly processForCmakeCommand: ProcessLike;
  private readonly processForCmakeTarget: ProcessLike;
  private readonly globSearch: GlobSearchLike;
}
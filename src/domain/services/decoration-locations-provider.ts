import { extensionName } from '../../extension-name';
import { VscodeWorkspaceLike } from './settings-provider';
import { StatFileLike, BuildTreeDirectoryResolver, FsLike } from './build-tree-directory-resolver';
import { Cmake, ProcessLike } from './cmake';
import { CoverageInfoFileResolver, GlobSearchLike } from './coverage-info-file-resolver';
import { StreamBuilder } from './uncovered-code-regions-collector';

type Adapters = {
  workspace: VscodeWorkspaceLike,
  statFile: StatFileLike,
  processForCmakeCommand: ProcessLike,
  processForCmakeTarget: ProcessLike,
  globSearch: GlobSearchLike,
  fs: FsLike,
  streamBuilder: StreamBuilder
};

export class DecorationLocationsProvider {
  constructor(adapters: Adapters) {
    this.workspace = adapters.workspace;
    this.statFile = adapters.statFile;
    this.processForCmakeCommand = adapters.processForCmakeCommand;
    this.processForCmakeTarget = adapters.processForCmakeTarget;
    this.globSearch = adapters.globSearch;
    this.fs = adapters.fs;
  }

  async getDecorationLocationsForUncoveredCodeRegions(_sourceFilePath: string) {
    const buildTreeDirectoryResolver = new BuildTreeDirectoryResolver({ workspace: this.workspace, statFile: this.statFile, fs: this.fs });
    await buildTreeDirectoryResolver.resolveBuildTreeDirectoryAbsolutePath();

    const cmake = new Cmake({
      workspace: this.workspace,
      processForCommand: this.processForCmakeCommand,
      processForTarget: this.processForCmakeTarget
    });

    await cmake.buildTarget();

    const coverageInfoFileResolver = new CoverageInfoFileResolver(this.workspace, this.globSearch);
    await coverageInfoFileResolver.resolveCoverageInfoFileFullPath();

    return Promise.reject(
      'Invalid coverage information file have been found in the build tree directory. ' +
      'Coverage information file must contain llvm coverage report in json format. ' +
      'Ensure that both ' +
      `'${extensionName}: Build Tree Directory' and '${extensionName}: Coverage Info File Name' ` +
      'settings are correctly set.');
  }

  private readonly workspace: VscodeWorkspaceLike;
  private readonly statFile: StatFileLike;
  private readonly processForCmakeCommand: ProcessLike;
  private readonly processForCmakeTarget: ProcessLike;
  private readonly globSearch: GlobSearchLike;
  private readonly fs: FsLike;
}
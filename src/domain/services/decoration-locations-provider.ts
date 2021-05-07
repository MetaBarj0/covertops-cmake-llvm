import { extensionName } from '../../extension-name';
import { VscodeWorkspaceLike } from './settings-provider';
import { StatFileLike, BuildTreeDirectoryResolver, FsLike } from './build-tree-directory-resolver';
import { Cmake, ProcessLike } from './cmake';
import { CoverageInfoFileResolver, GlobSearchLike } from './coverage-info-file-resolver';
import { StreamBuilder, UncoveredCodeRegionsCollector } from './uncovered-code-regions-collector';
import { Stream } from 'stream';

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
    this.streamBuilder = adapters.streamBuilder;
  }

  async getDecorationLocationsForUncoveredCodeRegions(sourceFilePath: string) {
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

    const collector = new UncoveredCodeRegionsCollector(this.streamBuilder);

    return collector.collectUncoveredCodeRegions(sourceFilePath);
  }

  private readonly workspace: VscodeWorkspaceLike;
  private readonly statFile: StatFileLike;
  private readonly processForCmakeCommand: ProcessLike;
  private readonly processForCmakeTarget: ProcessLike;
  private readonly globSearch: GlobSearchLike;
  private readonly fs: FsLike;
  private readonly streamBuilder: StreamBuilder;
}
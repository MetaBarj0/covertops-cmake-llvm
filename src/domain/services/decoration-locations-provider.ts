import { VscodeWorkspaceLike } from './settings-provider';
import * as BuildTreeDirectoryResolver from './internal/build-tree-directory-resolver';
import * as  BuildSystemGenerator from './internal/build-system-generator';
import { CoverageInfoFileResolver, GlobSearchLike } from './coverage-info-file-resolver';
import { LLVMCoverageInfoStreamBuilder, CoverageCollector } from './coverage-info-collector';

type Adapters = {
  workspace: VscodeWorkspaceLike,
  statFile: BuildTreeDirectoryResolver.StatFileLike,
  processForCmakeCommand: BuildSystemGenerator.ProcessLike,
  processForCmakeTarget: BuildSystemGenerator.ProcessLike,
  globSearch: GlobSearchLike,
  fs: BuildTreeDirectoryResolver.FsLike,
  llvmCoverageInfoStreamBuilder: LLVMCoverageInfoStreamBuilder
};

export class DecorationLocationsProvider {
  constructor(adapters: Adapters) {
    this.workspace = adapters.workspace;
    this.statFile = adapters.statFile;
    this.processForCmakeCommand = adapters.processForCmakeCommand;
    this.processForCmakeTarget = adapters.processForCmakeTarget;
    this.globSearch = adapters.globSearch;
    this.fs = adapters.fs;
    this.llvmCoverageInfoStreamBuilder = adapters.llvmCoverageInfoStreamBuilder;
  }

  async getDecorationLocationsForUncoveredCodeRegions(sourceFilePath: string) {
    const buildTreeDirectoryResolver = BuildTreeDirectoryResolver.make({
      workspace: this.workspace,
      statFile: this.statFile,
      fs: this.fs
    });

    await buildTreeDirectoryResolver.resolveAbsolutePath();

    const cmake = BuildSystemGenerator.make({
      workspace: this.workspace,
      processForCommand: this.processForCmakeCommand,
      processForTarget: this.processForCmakeTarget
    });

    await cmake.buildTarget();

    const coverageInfoFileResolver = new CoverageInfoFileResolver(this.workspace, this.globSearch);
    await coverageInfoFileResolver.resolveCoverageInfoFileFullPath();

    const collector = new CoverageCollector(this.llvmCoverageInfoStreamBuilder);

    return collector.collectFor(sourceFilePath);
  }

  private readonly workspace: VscodeWorkspaceLike;
  private readonly statFile: BuildTreeDirectoryResolver.StatFileLike;
  private readonly processForCmakeCommand: BuildSystemGenerator.ProcessLike;
  private readonly processForCmakeTarget: BuildSystemGenerator.ProcessLike;
  private readonly globSearch: GlobSearchLike;
  private readonly fs: BuildTreeDirectoryResolver.FsLike;
  private readonly llvmCoverageInfoStreamBuilder: LLVMCoverageInfoStreamBuilder;
}
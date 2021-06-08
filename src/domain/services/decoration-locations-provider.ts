import * as SettingsProvider from './internal/settings-provider';
import * as BuildTreeDirectoryResolver from './internal/build-tree-directory-resolver';
import * as  BuildSystemGenerator from './internal/build-system-generator';
import * as CoverageInfoFileResolver from './internal/coverage-info-file-resolver';
import * as CoverageInfoCollector from './internal/coverage-info-collector';

type Adapters = {
  workspace: SettingsProvider.VscodeWorkspaceLike,
  statFile: BuildTreeDirectoryResolver.StatFileLike,
  processForCmakeCommand: BuildSystemGenerator.ProcessLike,
  processForCmakeTarget: BuildSystemGenerator.ProcessLike,
  globSearch: CoverageInfoFileResolver.GlobSearchLike,
  fs: BuildTreeDirectoryResolver.FsLike,
  llvmCoverageInfoStreamFactoryBuilder: CoverageInfoCollector.LLVMCoverageInfoStreamFactoryBuilder
};

export class DecorationLocationsProvider {
  constructor(adapters: Adapters) {
    this.workspace = adapters.workspace;
    this.statFile = adapters.statFile;
    this.processForCmakeCommand = adapters.processForCmakeCommand;
    this.processForCmakeTarget = adapters.processForCmakeTarget;
    this.globSearch = adapters.globSearch;
    this.fs = adapters.fs;
    this.llvmCoverageInfoStreamFactoryBuilder = adapters.llvmCoverageInfoStreamFactoryBuilder;
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

    const coverageInfoFileResolver = CoverageInfoFileResolver.make({
      workspace: this.workspace,
      globSearch: this.globSearch
    });

    await coverageInfoFileResolver.resolveCoverageInfoFileFullPath();

    const collector = CoverageInfoCollector.make({
      workspace: this.workspace,
      globSearch: this.globSearch,
      llvmCoverageInfoStreamFactoryBuilder: this.llvmCoverageInfoStreamFactoryBuilder
    });

    return collector.collectFor(sourceFilePath);
  }

  private readonly workspace: SettingsProvider.VscodeWorkspaceLike;
  private readonly statFile: BuildTreeDirectoryResolver.StatFileLike;
  private readonly processForCmakeCommand: BuildSystemGenerator.ProcessLike;
  private readonly processForCmakeTarget: BuildSystemGenerator.ProcessLike;
  private readonly globSearch: CoverageInfoFileResolver.GlobSearchLike;
  private readonly fs: BuildTreeDirectoryResolver.FsLike;
  private readonly llvmCoverageInfoStreamFactoryBuilder: CoverageInfoCollector.LLVMCoverageInfoStreamFactoryBuilder;
}
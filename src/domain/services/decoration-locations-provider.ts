import * as SettingsProvider from './internal/settings-provider';
import * as BuildTreeDirectoryResolver from './internal/build-tree-directory-resolver';
import * as  BuildSystemGenerator from './internal/build-system-generator';
import * as CoverageInfoFileResolver from './internal/coverage-info-file-resolver';
import * as CoverageInfoCollector from './internal/coverage-info-collector';
import * as ProgressReporter from './internal/progress-reporter';

export class DecorationLocationsProvider {
  constructor(adapters: Adapters) {
    this.workspace = adapters.workspace;
    this.statFile = adapters.statFile;
    this.processForCmakeCommand = adapters.processForCmakeCommand;
    this.processForCmakeTarget = adapters.processForCmakeTarget;
    this.globSearch = adapters.globSearch;
    this.mkDir = adapters.mkDir;
    this.llvmCoverageInfoStreamBuilder = adapters.llvmCoverageInfoStreamBuilder;
    this.progressReporter = adapters.progressReporter;
  }

  async getDecorationLocationsForUncoveredCodeRegions(sourceFilePath: string) {
    const buildTreeDirectoryResolver = BuildTreeDirectoryResolver.make({
      workspace: this.workspace,
      statFile: this.statFile,
      mkDir: this.mkDir,
      progressReporter: this.progressReporter
    });

    await buildTreeDirectoryResolver.resolveAbsolutePath();

    const cmake = BuildSystemGenerator.make({
      workspace: this.workspace,
      processForCommand: this.processForCmakeCommand,
      processForTarget: this.processForCmakeTarget,
      progressReporter: this.progressReporter
    });

    await cmake.buildTarget();

    const coverageInfoFileResolver = CoverageInfoFileResolver.make({
      workspace: this.workspace,
      globSearch: this.globSearch,
      progressReporter: this.progressReporter
    });

    await coverageInfoFileResolver.resolveCoverageInfoFileFullPath();

    const collector = CoverageInfoCollector.make({
      workspace: this.workspace,
      globSearch: this.globSearch,
      llvmCoverageInfoStreamBuilder: this.llvmCoverageInfoStreamBuilder,
      progressReporter: this.progressReporter
    });

    return collector.collectFor(sourceFilePath);
  }

  private readonly workspace: SettingsProvider.VscodeWorkspaceLike;
  private readonly statFile: BuildTreeDirectoryResolver.StatFileLike;
  private readonly processForCmakeCommand: BuildSystemGenerator.ProcessLike;
  private readonly processForCmakeTarget: BuildSystemGenerator.ProcessLike;
  private readonly globSearch: CoverageInfoFileResolver.GlobSearchLike;
  private readonly mkDir: BuildTreeDirectoryResolver.MkDirLike;
  private readonly llvmCoverageInfoStreamBuilder: CoverageInfoCollector.LLVMCoverageInfoStreamBuilder;
  private readonly progressReporter: ProgressReporter.ProgressLike;
}

type Adapters = {
  workspace: SettingsProvider.VscodeWorkspaceLike,
  statFile: BuildTreeDirectoryResolver.StatFileLike,
  processForCmakeCommand: BuildSystemGenerator.ProcessLike,
  processForCmakeTarget: BuildSystemGenerator.ProcessLike,
  globSearch: CoverageInfoFileResolver.GlobSearchLike,
  mkDir: BuildTreeDirectoryResolver.MkDirLike,
  llvmCoverageInfoStreamBuilder: CoverageInfoCollector.LLVMCoverageInfoStreamBuilder,
  progressReporter: ProgressReporter.ProgressLike
};
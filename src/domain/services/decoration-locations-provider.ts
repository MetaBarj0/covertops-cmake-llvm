import * as BuildTreeDirectoryResolver from './internal/build-tree-directory-resolver';
import * as Cmake from './internal/cmake';
import * as CoverageInfoFileResolver from './internal/coverage-info-file-resolver';
import * as CoverageInfoCollector from './internal/coverage-info-collector';
import * as ProgressReporter from './internal/progress-reporter';
import * as ErrorChannel from './internal/error-channel';
import { DecorationLocationsProviderContract } from '../interfaces/decoration-locations-provider-contract';
import { StatFileCallable } from '../../adapters/interfaces/stat-file-callable';
import { VscodeWorkspaceLike } from '../../adapters/interfaces/vscode-workspace-like';

export class DecorationLocationsProvider implements DecorationLocationsProviderContract {
  constructor(adapters: Adapters) {
    this.workspace = adapters.workspace;
    this.statFile = adapters.statFile;
    this.processForCmakeCommand = adapters.processForCmakeCommand;
    this.processForCmakeTarget = adapters.processForCmakeTarget;
    this.globSearch = adapters.globSearch;
    this.mkDir = adapters.mkDir;
    this.llvmCoverageInfoStreamBuilder = adapters.llvmCoverageInfoStreamBuilder;
    this.progressReporter = adapters.progressReporter;
    this.errorChannel = adapters.errorChannel;
  }

  async getDecorationLocationsForUncoveredCodeRegions(sourceFilePath: string) {
    const buildTreeDirectoryResolver = BuildTreeDirectoryResolver.make({
      workspace: this.workspace,
      statFile: this.statFile,
      mkDir: this.mkDir,
      progressReporter: this.progressReporter,
      errorChannel: this.errorChannel
    });

    await buildTreeDirectoryResolver.resolveAbsolutePath();

    const cmake = Cmake.make({
      workspace: this.workspace,
      processForCommand: this.processForCmakeCommand,
      processForTarget: this.processForCmakeTarget,
      progressReporter: this.progressReporter,
      errorChannel: this.errorChannel
    });

    await cmake.buildTarget();

    const collector = CoverageInfoCollector.make({
      workspace: this.workspace,
      globSearch: this.globSearch,
      llvmCoverageInfoStreamBuilder: this.llvmCoverageInfoStreamBuilder,
      progressReporter: this.progressReporter,
      errorChannel: this.errorChannel
    });

    return collector.collectFor(sourceFilePath);
  }

  private readonly workspace: VscodeWorkspaceLike;
  private readonly statFile: StatFileCallable;
  private readonly processForCmakeCommand: Cmake.ProcessLike;
  private readonly processForCmakeTarget: Cmake.ProcessLike;
  private readonly globSearch: CoverageInfoFileResolver.GlobSearchLike;
  private readonly mkDir: BuildTreeDirectoryResolver.MkDirLike;
  private readonly llvmCoverageInfoStreamBuilder: CoverageInfoCollector.LLVMCoverageInfoStreamBuilder;
  private readonly progressReporter: ProgressReporter.ProgressLike;
  private readonly errorChannel: ErrorChannel.OutputChannelLike;
}

type Adapters = {
  workspace: VscodeWorkspaceLike,
  progressReporter: ProgressReporter.ProgressLike,
  errorChannel: ErrorChannel.OutputChannelLike
  statFile: StatFileCallable,
  processForCmakeCommand: Cmake.ProcessLike,
  processForCmakeTarget: Cmake.ProcessLike,
  globSearch: CoverageInfoFileResolver.GlobSearchLike,
  mkDir: BuildTreeDirectoryResolver.MkDirLike,
  llvmCoverageInfoStreamBuilder: CoverageInfoCollector.LLVMCoverageInfoStreamBuilder,
};
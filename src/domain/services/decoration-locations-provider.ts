import * as BuildTreeDirectoryResolver from './internal/build-tree-directory-resolver';
import * as Cmake from './internal/cmake';
import * as CoverageInfoFileResolver from './internal/coverage-info-file-resolver';
import * as CoverageInfoCollector from './internal/coverage-info-collector';
import * as ProgressReporter from './internal/progress-reporter';
import * as ErrorChannel from './internal/error-channel';
// TODO: module import syntax
import { DecorationLocationsProviderContract } from '../interfaces/decoration-locations-provider-contract';
import { StatFileCallable } from '../../adapters/interfaces/file-system';
import { VscodeWorkspaceLike } from '../../adapters/interfaces/vscode-workspace';
import { ExecFileCallable } from '../../adapters/interfaces/process-control';

export class DecorationLocationsProvider implements DecorationLocationsProviderContract {
  constructor(adapters: Adapters) {
    this.workspace = adapters.workspace;
    this.statFile = adapters.statFile;
    this.execFileForCmakeCommand = adapters.execFileForCmakeCommand;
    this.execFileForCmakeTarget = adapters.execFileForCmakeTarget;
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
      processControl: {
        execFileForCommand: this.execFileForCmakeCommand,
        execFileForTarget: this.execFileForCmakeTarget,
      },
      vscode: {
        workspace: this.workspace,
        progressReporter: this.progressReporter,
        errorChannel: this.errorChannel
      }
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
  private readonly execFileForCmakeCommand: ExecFileCallable;
  private readonly execFileForCmakeTarget: ExecFileCallable;
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
  execFileForCmakeCommand: ExecFileCallable,
  execFileForCmakeTarget: ExecFileCallable,
  globSearch: CoverageInfoFileResolver.GlobSearchLike,
  mkDir: BuildTreeDirectoryResolver.MkDirLike,
  llvmCoverageInfoStreamBuilder: CoverageInfoCollector.LLVMCoverageInfoStreamBuilder,
};
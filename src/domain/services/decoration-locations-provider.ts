import * as BuildTreeDirectoryResolver from './internal/build-tree-directory-resolver';
import * as Cmake from './internal/cmake';
import * as CoverageInfoCollector from './internal/coverage-info-collector';
// TODO: module import syntax???
import { DecorationLocationsProviderContract } from '../interfaces/decoration-locations-provider-contract';
import { CreateReadStreamCallable, GlobSearchCallable, MkdirCallable, StatCallable } from '../../adapters/interfaces/file-system';
import { OutputChannelLike, ProgressLike, VscodeWorkspaceLike } from '../../adapters/interfaces/vscode';
import { ExecFileCallable } from '../../adapters/interfaces/process-control';

export class DecorationLocationsProvider implements DecorationLocationsProviderContract {
  constructor(adapters: Adapters) {
    this.workspace = adapters.workspace;
    this.stat = adapters.stat;
    this.execFileForCmakeCommand = adapters.execFileForCmakeCommand;
    this.execFileForCmakeTarget = adapters.execFileForCmakeTarget;
    this.globSearch = adapters.globSearch;
    this.mkdir = adapters.mkdir;
    this.createReadStream = adapters.createReadStream;
    this.progressReporter = adapters.progressReporter;
    this.errorChannel = adapters.errorChannel;
  }

  async getDecorationLocationsForUncoveredCodeRegions(sourceFilePath: string) {
    const buildTreeDirectoryResolver = BuildTreeDirectoryResolver.make({
      workspace: this.workspace,
      stat: this.stat,
      mkDir: this.mkdir,
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
      createReadStream: this.createReadStream,
      progressReporter: this.progressReporter,
      errorChannel: this.errorChannel
    });

    return collector.collectFor(sourceFilePath);
  }

  private readonly workspace: VscodeWorkspaceLike;
  private readonly stat: StatCallable;
  private readonly execFileForCmakeCommand: ExecFileCallable;
  private readonly execFileForCmakeTarget: ExecFileCallable;
  private readonly globSearch: GlobSearchCallable;
  private readonly mkdir: MkdirCallable;
  private readonly createReadStream: CreateReadStreamCallable;
  private readonly progressReporter: ProgressLike;
  private readonly errorChannel: OutputChannelLike;
}

type Adapters = {
  workspace: VscodeWorkspaceLike,
  progressReporter: ProgressLike,
  errorChannel: OutputChannelLike
  stat: StatCallable,
  execFileForCmakeCommand: ExecFileCallable,
  execFileForCmakeTarget: ExecFileCallable,
  globSearch: GlobSearchCallable,
  mkdir: MkdirCallable,
  createReadStream: CreateReadStreamCallable,
};
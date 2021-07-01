// TODO: refacto in imports
import * as BuildTreeDirectoryResolver from '../../build-tree-directory-resolver/domain/build-tree-directory-resolver';
import * as Cmake from '../../cmake/domain/cmake';
import * as CoverageInfoCollector from '../../coverage-info-collector/domain/coverage-info-collector';
import * as Abstractions from '../abstractions/domain/decoration-locations-provider';
import { CreateReadStreamCallable, GlobSearchCallable, MkdirCallable, StatCallable } from '../../../shared-kernel/abstractions/file-system';
import { OutputChannelLike, ProgressLike, VscodeWorkspaceLike } from '../../../shared-kernel/abstractions/vscode';
import { ExecFileCallable } from '../../../shared-kernel/abstractions/process-control';
import { Settings } from '../../settings-provider/abstractions/domain/settings';

import * as Imports from '../imports';

export function make(context: Context): Imports.Abstractions.Domain.DecorationLocationsProvider {
  return new DecorationLocationsProvider({
    settings: context.settings,
    stat: context.fileSystem.stat,
    execFileForCmakeCommand: context.processControl.execFileForCommand,
    execFileForCmakeTarget: context.processControl.execFileForTarget,
    globSearch: context.fileSystem.globSearch,
    mkdir: context.fileSystem.mkdir,
    createReadStream: context.fileSystem.createReadStream,
    progressReporter: context.vscode.progressReporter,
    errorChannel: context.vscode.errorChannel
  });
}

type Context = {
  settings: Imports.Abstractions.Domain.Settings,
  vscode: {
    progressReporter: ProgressLike,
    errorChannel: OutputChannelLike,
    workspace: VscodeWorkspaceLike
  },
  processControl: {
    execFileForCommand: ExecFileCallable,
    execFileForTarget: ExecFileCallable,
  },
  fileSystem: {
    stat: StatCallable,
    mkdir: MkdirCallable,
    globSearch: GlobSearchCallable,
    createReadStream: CreateReadStreamCallable
  }
};

class DecorationLocationsProvider implements Abstractions.DecorationLocationsProvider {
  constructor(context: ContextToBeRefacto) {
    this.settings = context.settings;
    this.stat = context.stat;
    this.execFileForCmakeCommand = context.execFileForCmakeCommand;
    this.execFileForCmakeTarget = context.execFileForCmakeTarget;
    this.globSearch = context.globSearch;
    this.mkdir = context.mkdir;
    this.createReadStream = context.createReadStream;
    this.progressReporter = context.progressReporter;
    this.errorChannel = context.errorChannel;
  }

  async getDecorationLocationsForUncoveredCodeRegions(sourceFilePath: string) {
    const buildTreeDirectoryResolver = BuildTreeDirectoryResolver.make({
      settings: this.settings,
      stat: this.stat,
      mkDir: this.mkdir,
      progressReporter: this.progressReporter,
      errorChannel: this.errorChannel
    });

    await buildTreeDirectoryResolver.resolve();

    const cmake = Cmake.make({
      settings: this.settings,
      processControl: {
        execFileForCommand: this.execFileForCmakeCommand,
        execFileForTarget: this.execFileForCmakeTarget,
      },
      vscode: {
        progressReporter: this.progressReporter,
        errorChannel: this.errorChannel
      }
    });

    await cmake.buildTarget();

    const collector = CoverageInfoCollector.make({
      settings: this.settings,
      globSearch: this.globSearch,
      createReadStream: this.createReadStream,
      progressReporter: this.progressReporter,
      errorChannel: this.errorChannel
    });

    return collector.collectFor(sourceFilePath);
  }

  private readonly settings: Settings;
  private readonly stat: StatCallable;
  private readonly execFileForCmakeCommand: ExecFileCallable;
  private readonly execFileForCmakeTarget: ExecFileCallable;
  private readonly globSearch: GlobSearchCallable;
  private readonly mkdir: MkdirCallable;
  private readonly createReadStream: CreateReadStreamCallable;
  private readonly progressReporter: ProgressLike;
  private readonly errorChannel: OutputChannelLike;
}

type ContextToBeRefacto = {
  settings: Settings,
  progressReporter: ProgressLike,
  errorChannel: OutputChannelLike
  stat: StatCallable,
  execFileForCmakeCommand: ExecFileCallable,
  execFileForCmakeTarget: ExecFileCallable,
  globSearch: GlobSearchCallable,
  mkdir: MkdirCallable,
  createReadStream: CreateReadStreamCallable,
};
// TODO: refacto in imports
import * as Cmake from '../../cmake/domain/cmake';
import * as CoverageInfoCollector from '../../coverage-info-collector/domain/coverage-info-collector';
import * as Abstractions from '../abstractions/domain/decoration-locations-provider';
import { CreateReadStreamCallable, GlobSearchCallable } from '../../../shared-kernel/abstractions/file-system';
import { OutputChannelLike, ProgressLike, VscodeWorkspaceLike } from '../../../shared-kernel/abstractions/vscode';
import { ExecFileCallable } from '../../../shared-kernel/abstractions/process-control';

import * as Imports from '../imports';

export function make(context: Context): Imports.Abstractions.Domain.DecorationLocationsProvider {
  return new DecorationLocationsProvider({
    settings: context.settings,
    buildTreeDirectoryResolver: context.buildTreeDirectoryResolver,
    execFileForCmakeCommand: context.processControl.execFileForCommand,
    execFileForCmakeTarget: context.processControl.execFileForTarget,
    globSearch: context.fileSystem.globSearch,
    createReadStream: context.fileSystem.createReadStream,
    progressReporter: context.vscode.progressReporter,
    errorChannel: context.vscode.errorChannel
  });
}

type Context = {
  settings: Imports.Abstractions.Domain.Settings,
  buildTreeDirectoryResolver: Imports.Abstractions.Domain.BuildTreeDirectoryResolver,
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
    globSearch: GlobSearchCallable,
    createReadStream: CreateReadStreamCallable
  }
};

class DecorationLocationsProvider implements Abstractions.DecorationLocationsProvider {
  constructor(context: ContextToBeRefacto) {
    this.settings = context.settings;
    this.buildTreeDirectoryResolver = context.buildTreeDirectoryResolver;
    this.execFileForCmakeCommand = context.execFileForCmakeCommand;
    this.execFileForCmakeTarget = context.execFileForCmakeTarget;
    this.globSearch = context.globSearch;
    this.createReadStream = context.createReadStream;
    this.progressReporter = context.progressReporter;
    this.errorChannel = context.errorChannel;
  }

  async getDecorationLocationsForUncoveredCodeRegions(sourceFilePath: string) {
    await this.buildTreeDirectoryResolver.resolve();

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

  private readonly settings: Imports.Abstractions.Domain.Settings;
  private readonly buildTreeDirectoryResolver: Imports.Abstractions.Domain.BuildTreeDirectoryResolver;
  private readonly execFileForCmakeCommand: ExecFileCallable;
  private readonly execFileForCmakeTarget: ExecFileCallable;
  private readonly globSearch: GlobSearchCallable;
  private readonly createReadStream: CreateReadStreamCallable;
  private readonly progressReporter: ProgressLike;
  private readonly errorChannel: OutputChannelLike;
}

type ContextToBeRefacto = {
  settings: Imports.Abstractions.Domain.Settings,
  buildTreeDirectoryResolver: Imports.Abstractions.Domain.BuildTreeDirectoryResolver,
  progressReporter: ProgressLike,
  errorChannel: OutputChannelLike
  execFileForCmakeCommand: ExecFileCallable,
  execFileForCmakeTarget: ExecFileCallable,
  globSearch: GlobSearchCallable,
  createReadStream: CreateReadStreamCallable,
};
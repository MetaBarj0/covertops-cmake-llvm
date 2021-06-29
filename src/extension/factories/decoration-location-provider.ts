import { DecorationLocationsProviderContract } from '../../domain/interfaces/decoration-locations-provider-contract';
import { DecorationLocationsProvider } from '../../domain/services/decoration-locations-provider';
import { OutputChannelLike, ProgressLike, VscodeWorkspaceLike } from '../../adapters/interfaces/vscode';

import { ExecFileCallable } from '../../adapters/interfaces/process-control';
import { CreateReadStreamCallable, GlobSearchCallable, MkdirCallable, StatCallable } from '../../adapters/interfaces/file-system';

export function make(adapters: Adapters): DecorationLocationsProviderContract {
  return new DecorationLocationsProvider({
    workspace: adapters.vscode.workspace,
    stat: adapters.fileSystem.stat,
    execFileForCmakeCommand: adapters.processControl.execFileForCommand,
    execFileForCmakeTarget: adapters.processControl.execFileForTarget,
    globSearch: adapters.fileSystem.globSearch,
    mkdir: adapters.fileSystem.mkdir,
    createReadStream: adapters.fileSystem.createReadStream,
    progressReporter: adapters.vscode.progressReporter,
    errorChannel: adapters.vscode.errorChannel
  });
}

type Adapters = {
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
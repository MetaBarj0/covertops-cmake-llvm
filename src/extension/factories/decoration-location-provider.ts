import * as vscode from 'vscode';

import { DecorationLocationsProviderContract } from '../../domain/interfaces/decoration-locations-provider-contract';
import { DecorationLocationsProvider } from '../../domain/services/decoration-locations-provider';
import * as ErrorChannel from '../../domain/services/internal/error-channel';

import * as fs from '../../adapters/file-system';
import { ExecFileCallable } from '../../adapters/interfaces/process-control';

export function make(adapters: Adapters): DecorationLocationsProviderContract {
  return new DecorationLocationsProvider({
    workspace: vscode.workspace,
    statFile: fs.stat,
    execFileForCmakeCommand: adapters.processControl.execFileForCommand,
    execFileForCmakeTarget: adapters.processControl.execFileForTarget,
    globSearch: fs.globSearch,
    mkdir: fs.mkdir,
    createReadStream: fs.readableStream,
    progressReporter: adapters.vscode.progressReporter,
    errorChannel: adapters.vscode.errorChannel
  });
}

type Adapters = {
  vscode: {
    progressReporter: vscode.Progress<{ message?: string, increment?: number }>,
    errorChannel: ErrorChannel.OutputChannelLike
  },
  processControl: {
    execFileForCommand: ExecFileCallable,
    execFileForTarget: ExecFileCallable,
  }
};
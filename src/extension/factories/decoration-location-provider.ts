import * as vscode from 'vscode';

import { DecorationLocationsProviderContract } from '../../domain/interfaces/decoration-locations-provider-contract';
import { DecorationLocationsProvider } from '../../domain/services/decoration-locations-provider';
import * as ErrorChannel from '../../domain/services/internal/error-channel';

import { fileSystem } from '../../adapters/file-system';
import { childProcess } from '../../adapters/child-process';
import { inputStream } from '../../adapters/input-stream';

export function make(adapters: Adapters): DecorationLocationsProviderContract {
  return new DecorationLocationsProvider({
    workspace: vscode.workspace,
    statFile: fileSystem.stat,
    execFileForCmakeCommand: childProcess.executeFile,
    execFileForCmakeTarget: childProcess.executeFile,
    globSearch: fileSystem.globSearch,
    mkDir: fileSystem.makeDirectory,
    llvmCoverageInfoStreamBuilder: inputStream.readableStream,
    progressReporter: adapters.vscode.progressReporter,
    errorChannel: adapters.vscode.errorChannel
  });
}

type Adapters = {
  vscode: {
    progressReporter: vscode.Progress<{ message?: string, increment?: number }>,
    errorChannel: ErrorChannel.OutputChannelLike
  }
};
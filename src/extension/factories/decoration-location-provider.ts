import * as vscode from 'vscode';

import { DecorationLocationsProvider } from '../../domain/services/decoration-locations-provider';

import { fileSystem } from '../../adapters/file-system';
import { childProcess } from '../../adapters/child-process';
import { inputStream } from '../../adapters/input-stream';

export function make(adapters: Adapters) {
  return new DecorationLocationsProvider({
    workspace: vscode.workspace,
    statFile: fileSystem.statFile,
    processForCmakeCommand: childProcess.executeFile,
    processForCmakeTarget: childProcess.executeFile,
    globSearch: fileSystem.globSearch,
    mkDir: fileSystem.makeDirectory,
    llvmCoverageInfoStreamBuilder: inputStream.readableStream,
    progressReporter: adapters.progressReporter
  });
}

type Adapters = {
  progressReporter: vscode.Progress<{ message?: string, increment?: number }>
};
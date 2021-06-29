import * as CoverageInfoFileResolver from '../../coverage-info-file-resolver/domain/coverage-info-file-resolver';
import * as Abstractions from '../abstractions/domain/coverage-info-collector';
import { OutputChannelLike, ProgressLike } from '../../../adapters/interfaces/vscode';
import { CreateReadStreamCallable, GlobSearchCallable } from '../../../adapters/interfaces/file-system';
import { SettingsContract } from '../../../domain/interfaces/settings-contract';

import { Readable } from 'stream';
import { CoverageInfo } from './coverage-info';

export function make(adapters: Adapters): Abstractions.CoverageInfoCollector {
  return new CoverageInfoCollector(adapters);
}

export type LLVMCoverageInfoStreamBuilder = {
  createStream: (path: string) => Readable;
};

class CoverageInfoCollector implements Abstractions.CoverageInfoCollector {
  constructor(adapters: Adapters) {
    this.settings = adapters.settings;
    this.globSearch = adapters.globSearch;
    this.createReadStream = adapters.createReadStream;
    this.progressReporter = adapters.progressReporter;
    this.errorChannel = adapters.errorChannel;
  }

  async collectFor(sourceFilePath: string) {
    const coverageInfoFileResolver = CoverageInfoFileResolver.make({
      settings: this.settings,
      globSearch: this.globSearch,
      progressReporter: this.progressReporter,
      errorChannel: this.errorChannel
    });

    const path = await coverageInfoFileResolver.resolveCoverageInfoFileFullPath();

    // TODO: find a way to report progress...better
    this.progressReporter.report({
      message: 'Prepared summary and uncovered region of code information.',
      increment: 100 / 6 * 6
    });

    return new CoverageInfo(() => this.createReadStream(path), sourceFilePath, this.errorChannel);
  }

  private readonly settings: SettingsContract;
  private readonly globSearch: GlobSearchCallable;
  private readonly createReadStream: CreateReadStreamCallable;
  private readonly progressReporter: ProgressLike;
  private readonly errorChannel: OutputChannelLike;
};

type Adapters = {
  settings: SettingsContract,
  globSearch: GlobSearchCallable,
  createReadStream: CreateReadStreamCallable,
  progressReporter: ProgressLike,
  errorChannel: OutputChannelLike
};

import { CreateReadStreamCallable, GlobSearchCallable } from '../../../../shared-kernel/abstractions/file-system';
import { OutputChannelLike, ProgressLike } from '../../../../shared-kernel/abstractions/vscode';

import * as CoverageInfoFileResolver from '../../../coverage-info-file-resolver/domain/coverage-info-file-resolver';
import * as Abstractions from '../abstractions/coverage-info-collector';
import { Settings } from '../../../settings-provider/domain/abstractions/settings';

import { Readable } from 'stream';
import * as CoverageInfo from './coverage-info';

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

    return CoverageInfo.make(() => this.createReadStream(path), sourceFilePath, this.errorChannel);
  }

  private readonly settings: Settings;
  private readonly globSearch: GlobSearchCallable;
  private readonly createReadStream: CreateReadStreamCallable;
  private readonly progressReporter: ProgressLike;
  private readonly errorChannel: OutputChannelLike;
};

type Adapters = {
  settings: Settings,
  globSearch: GlobSearchCallable,
  createReadStream: CreateReadStreamCallable,
  progressReporter: ProgressLike,
  errorChannel: OutputChannelLike
};

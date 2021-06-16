import * as DecorationLocationsProviderFactory from './decoration-location-provider';
import { DecorationLocationsProvider } from '../../domain/services/decoration-locations-provider';

import { Disposable, OutputChannel, window } from "vscode";
import { extensionId } from '../../definitions';

export function make() {
  return new Cov();
}

class Cov {
  constructor() {
    this.outputChannel_ = window.createOutputChannel(extensionId);
  }

  get asDisposable() {
    return Disposable.from(this);
  }

  get outputChannel() {
    return this.outputChannel_;
  }

  dispose() {
    this.outputChannel_.dispose();
  }

  private readonly outputChannel_: OutputChannel;
}
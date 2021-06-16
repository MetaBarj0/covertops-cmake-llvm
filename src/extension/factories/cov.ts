import * as DecorationLocationsProviderFactory from './decoration-location-provider';
import { DecorationLocationsProvider } from '../../domain/services/decoration-locations-provider';

import { Disposable } from "vscode";

export function make() {
  return new Cov();
}

class Cov {
  constructor() {
    this.decorationLocationProvider = DecorationLocationsProviderFactory.make();
  }

  get asDisposable() {
    return Disposable.from(this);
  }

  dispose() { }

  private readonly decorationLocationProvider: DecorationLocationsProvider;
}
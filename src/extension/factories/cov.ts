import * as DecorationLocationsProviderFactory from './decoration-location-provider';
import { DecorationLocationsProvider } from '../../domain/services/decoration-locations-provider';

import { Disposable } from "vscode";

export function make() {
  return Disposable.from(new Cov());
}

class Cov {
  constructor() {
    this.decorationLocationProvider = DecorationLocationsProviderFactory.make();
  }

  dispose() { }

  private readonly decorationLocationProvider: DecorationLocationsProvider;
}
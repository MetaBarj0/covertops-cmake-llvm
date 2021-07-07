import { ProgressLike } from "../../../src/shared-kernel/abstractions/vscode";

import { Spy } from "../../utils/spy";

export function buildFakeProgressReporter(): ProgressLike {

  return new class implements ProgressLike {
    report(_value: ProgressStep) { }
  };
}

export function buildSpyOfProgressReporter(progressReporter: ProgressLike): Spy<ProgressLike> {
  return new class extends Spy<ProgressLike> implements ProgressLike {
    constructor(progressReporter: ProgressLike) {
      super(progressReporter);
    }

    report(value: ProgressStep) {
      this.decorated.report(value);
      super.incrementCallCountFor('report');
    }

    get object() {
      return this;
    }
  }(progressReporter);
}

// TODO: interesting approach to infer argument type but use an exported type instead
type ProgressStep = ProgressLike['report'] extends (value: infer T) => void ? T : never;

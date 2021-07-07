import { ProgressLike, ProgressStep } from "../../../src/shared-kernel/abstractions/vscode";

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

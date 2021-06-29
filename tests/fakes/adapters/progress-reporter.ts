import { ProgressLike } from "../../../src/adapters/interfaces/vscode";

import { Spy } from "../../utils/spy";

export namespace progressReporter {
  export function buildFakeProgressReporter(): ProgressLike {

    return new class implements ProgressLike {
      report(_value: ProgressStep) { }
    };
  }

  export function buildSpyOfProgressReporter(progressReporter: ProgressLike): Spy<ProgressLike> {
    return new class extends Spy<ProgressLike> implements ProgressLike {
      constructor(progressReporter: ProgressLike) {
        super();

        this.progressReporter = progressReporter;
      }

      report(value: ProgressStep) {
        this.progressReporter.report(value);
        super.incrementCallCountFor('report');
      }

      get object() {
        return this;
      }

      private readonly progressReporter: ProgressLike;
    }(progressReporter);
  }
}

type ProgressStep = ProgressLike['report'] extends (value: infer T) => void ? T : never;

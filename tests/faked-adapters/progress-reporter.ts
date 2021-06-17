import { ProgressLike } from "../../src/domain/services/internal/progress-reporter";

export namespace progressReporter {
  export function buildFakeProgressReporter() {
    type ProgressStep = ProgressLike['report'] extends (value: infer T) => void ? T : never;

    return new class implements ProgressLike {
      report(_value: ProgressStep): void { }
    };
  }
}
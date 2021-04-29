import { Readable } from "stream";
import { UncoveredCodeRegionsCollector } from "../../../../src/domain/services/uncovered-code-regions-collector";

class FailingUncoveredCodeRegionsCollector extends UncoveredCodeRegionsCollector {
  collectUncoveredCodeRegions() {
    return Promise.reject('Error: Could not find the file containing coverage information. ' +
      'Ensure \'cmake-llvm-coverage Cmake Target\' and/or \'cmake-llvm-coverage Coverage Info File Name\' ' +
      'settings are properly set.');
  }
};

class SucceedingUncoveredCodeRegionsCollector extends UncoveredCodeRegionsCollector {
  collectUncoveredCodeRegions() {
    return Promise.resolve();
  }
};

const empty = (function* () { })();

export function buildFailingUncoveredCodeRegionsCollector() {
  return new FailingUncoveredCodeRegionsCollector(Readable.from(empty));
}

export function buildSucceedingUncoveredCodeRegionsCollector() {
  return new SucceedingUncoveredCodeRegionsCollector(Readable.from(empty));
}

export function buildFakeUncoveredCodeRegionsCollector() {
  return buildFailingUncoveredCodeRegionsCollector();
}
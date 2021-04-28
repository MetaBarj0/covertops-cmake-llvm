import { UncoveredCodeRegionsCollector } from '../../../../src/domain/ports/uncovered-code-regions-collector';

class FailingUncoveredCodeRegionsCollector implements UncoveredCodeRegionsCollector {
  collectUncoveredCodeRegions() {
    return Promise.reject('Error: Could not find the file containing coverage information. ' +
      'Ensure \'cmake-llvm-coverage Cmake Target\' and/or \'cmake-llvm-coverage Coverage Info File Name\' ' +
      'settings are properly set.');
  }
};

class SucceedingUncoveredCodeRegionsCollector implements UncoveredCodeRegionsCollector {
  collectUncoveredCodeRegions() {
    return Promise.resolve();
  }
};

export function buildFailingUncoveredCodeRegionsCollector() {
  return new FailingUncoveredCodeRegionsCollector();
}

export function buildSucceedingUncoveredCodeRegionsCollector() {
  return new SucceedingUncoveredCodeRegionsCollector();
}

export function buildFakeUncoveredCodeRegionsCollector() {
  return buildFailingUncoveredCodeRegionsCollector();
}
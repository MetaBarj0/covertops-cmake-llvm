import { UncoveredCodeRegionsCollector } from '../../../../src/ports/uncoveredCodeRegionsCollector';

class FailingUncoveredCodeRegionsCollector implements UncoveredCodeRegionsCollector {
  collectUncoveredCodeRegions() {
    return Promise.reject();
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
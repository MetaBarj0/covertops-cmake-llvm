import { CoverageInfoFileResolver } from '../../../../service';

class FailingCoverageInfoFileResolver implements CoverageInfoFileResolver {
  gatherCoverageInfo() {
    return Promise.reject();
  }
};

class SucceedingCoverageInfoFileResolver implements CoverageInfoFileResolver {
  gatherCoverageInfo() {
    return Promise.resolve();
  }
};

export function buildFailingCoverageInfoFileResolver() {
  return new FailingCoverageInfoFileResolver();
}

export function buildSucceedingCoverageInfoFileResolver() {
  return new SucceedingCoverageInfoFileResolver();
}

export function buildFakeCoverageInfoFileResolver() {
  return buildFailingCoverageInfoFileResolver();

}
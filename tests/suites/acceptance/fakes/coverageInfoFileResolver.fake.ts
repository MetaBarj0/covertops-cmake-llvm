import { CoverageInfoFilesResolver } from '../../../../src/ports/coverageInfoFilesResolver';

class FailingCoverageInfoFileResolver implements CoverageInfoFilesResolver {
  findAllFiles() {
    return Promise.reject();
  }
};

class SucceedingCoverageInfoFileResolver implements CoverageInfoFilesResolver {
  findAllFiles() {
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
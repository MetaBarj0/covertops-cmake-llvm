import { BuildTreeDirectoryResolver } from '../../../../src/ports/buildTreeDirectoryResolver';

class SucceedingBuildTreeDirectoryResolver implements BuildTreeDirectoryResolver {
  resolveFullPath() {
    return Promise.resolve();
  }
}

class FailingBuildTreeDirectoryResolver implements BuildTreeDirectoryResolver {
  resolveFullPath() {
    return Promise.reject(
      'Error: Build tree directory cannot be found. ' +
      'Ensure \'cmake-llvm-coverage Build Tree Directory\' setting is properly set.');
  }
}

export function buildFakeBuildTreeDirectoryResolver() {
  return new SucceedingBuildTreeDirectoryResolver();
}

export function buildSucceedingBuildTreeDirectoryResolver() {
  return new SucceedingBuildTreeDirectoryResolver();
}

export function buildFailingBuildTreeDirectoryResolver() {
  return new FailingBuildTreeDirectoryResolver();
}
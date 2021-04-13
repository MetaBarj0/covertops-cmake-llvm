import { BuildTreeDirectoryResolver } from '../../../../src/adapters/buildTreeDirectoryResolver';

class SucceedingBuildTreeDirectoryResolver implements BuildTreeDirectoryResolver {
  getFullPath() {
    return Promise.resolve('');
  }
}

class FailingBuildTreeDirectoryResolver implements BuildTreeDirectoryResolver {
  getFullPath() {
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
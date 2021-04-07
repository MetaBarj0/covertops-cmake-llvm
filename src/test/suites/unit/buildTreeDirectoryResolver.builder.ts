import { BuildTreeDirectoryResolver } from '../../../cppLlvmCoverage';

class SucceedingBuildTreeDirectoryResolver implements BuildTreeDirectoryResolver {
  resolve() {
    return Promise.resolve();
  }
}

class FailingBuildTreeDirectoryResolver implements BuildTreeDirectoryResolver {
  resolve() {
    return Promise.reject(new Error());
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
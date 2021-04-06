import { BuildTreeDirectoryResolver } from '../../../cppLlvmCoverage';

class SucceedingBuildTreeDirectoryResolver implements BuildTreeDirectoryResolver {
  readonly path?: string;

  resolve() {
    return Promise.resolve();
  }
}

class FailingBuildTreeDirectoryResolver implements BuildTreeDirectoryResolver {
  readonly path?: string;

  resolve() {
    return Promise.reject(new Error());
  }
}

export function buildAnyBuildTreeDirectoryResolver() {
  return new SucceedingBuildTreeDirectoryResolver();
}

export function buildSucceedingBuildTreeDirectoryResolver() {
  return new SucceedingBuildTreeDirectoryResolver();
}

export function buildFailingBuildTreeDirectoryResolver() {
  return new FailingBuildTreeDirectoryResolver();
}
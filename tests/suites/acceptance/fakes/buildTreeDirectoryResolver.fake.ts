import { BuildTreeDirectoryResolver } from '../../../../src/adapters/buildTreeDirectoryResolver';

class SucceedingBuildTreeDirectoryResolver implements BuildTreeDirectoryResolver {
  findDirectory() {
    return Promise.resolve();
  }
}

class FailingBuildTreeDirectoryResolver implements BuildTreeDirectoryResolver {
  findDirectory() {
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
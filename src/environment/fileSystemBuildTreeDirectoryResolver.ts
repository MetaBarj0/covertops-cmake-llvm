import { BuildTreeDirectoryResolver } from "../adapters/buildTreeDirectoryResolver";

export class FileSystemBuildTreeDirectoryResolver implements BuildTreeDirectoryResolver {
  findDirectory() { return Promise.reject(); }
};

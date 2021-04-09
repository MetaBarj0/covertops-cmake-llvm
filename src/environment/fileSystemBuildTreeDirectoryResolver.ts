import { BuildTreeDirectoryResolver } from "../services/buildTreeDirectoryResolver";

export class FileSystemBuildTreeDirectoryResolver implements BuildTreeDirectoryResolver {
  findDirectory() { return Promise.reject(); }
};

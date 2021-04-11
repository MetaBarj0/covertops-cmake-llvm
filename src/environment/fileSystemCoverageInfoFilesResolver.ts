import { CoverageInfoFilesResolver } from "../adapters/coverageInfoFilesResolver";

export class FileSystemCoverageInfoFilesResolver implements CoverageInfoFilesResolver {
  findAllFiles() { return Promise.reject(); }
};

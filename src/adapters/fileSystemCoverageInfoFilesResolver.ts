import { CoverageInfoFilesResolver } from "../ports/coverageInfoFilesResolver";

export class FileSystemCoverageInfoFilesResolver implements CoverageInfoFilesResolver {
  findAllFiles() { return Promise.reject(); }
};

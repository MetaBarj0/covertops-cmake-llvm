import { CoverageInfoFilesResolver } from "../services/coverageInfoFilesResolver";

export class FileSystemCoverageInfoFilesResolver implements CoverageInfoFilesResolver {
  findAllFiles() { return Promise.reject(); }
};

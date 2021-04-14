import { CoverageDecorations } from '../records/coverageDecorations';
import { CmakeProcess } from '../adapters/cmakeProcess';
import { BuildTreeDirectoryResolver } from '../adapters/buildTreeDirectoryResolver';
import { CoverageInfoFilesResolver } from '../adapters/coverageInfoFilesResolver';

export class DecorationLocationProvider {
  constructor(
    cmakeProcess: CmakeProcess,
    buildTreeDirectoryResolver: BuildTreeDirectoryResolver,
    coverageInfoFileResolver: CoverageInfoFilesResolver) {
    this.cmakeProcess = cmakeProcess;
    this.buildTreeDirectoryResolver = buildTreeDirectoryResolver;
    this.coverageInfoFileResolver = coverageInfoFileResolver;
  }

  async obtainDecorationForUncoveredCodeRegions() {
    await Promise.all([
      this.buildTreeDirectoryResolver.getFullPath(),
      this.cmakeProcess.buildCmakeTarget(),
      this.gatherCoverageInfo()]);

    return <CoverageDecorations>{};
  }

  private async gatherCoverageInfo() {
    try {
      await this.coverageInfoFileResolver.findAllFiles();
    } catch (e) {
      throw new Error('Error: Could not find any file containing coverage information using ' +
        'regular expression patterns provided in settings. ' +
        'Ensure \'cmake-llvm-coverage Cmake Target\' setting is properly set.');
    }
  }

  private readonly cmakeProcess: CmakeProcess;
  private readonly buildTreeDirectoryResolver: BuildTreeDirectoryResolver;
  private readonly coverageInfoFileResolver: CoverageInfoFilesResolver;
}
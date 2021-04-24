import { CoverageDecorations } from '../records/coverageDecorations';
import { CmakeProcess } from '../ports/cmakeProcess';
import { BuildTreeDirectoryResolver } from '../ports/buildTreeDirectoryResolver';
import { UncoveredCodeRegionsCollector } from '../ports/uncoveredCodeRegionsCollector';

export class DecorationLocationsProvider {
  constructor(
    cmakeProcess: CmakeProcess,
    buildTreeDirectoryResolver: BuildTreeDirectoryResolver,
    coverageInfoFileResolver: UncoveredCodeRegionsCollector) {
    this.cmakeProcess = cmakeProcess;
    this.buildTreeDirectoryResolver = buildTreeDirectoryResolver;
    this.coverageInfoFileResolver = coverageInfoFileResolver;
  }

  async getDecorationLocationsForUncoveredCodeRegions() {
    await Promise.all([
      this.buildTreeDirectoryResolver.resolveFullPath(),
      this.cmakeProcess.buildCmakeTarget(),
      this.gatherCoverageInfo()]);

    return <CoverageDecorations>{};
  }

  private async gatherCoverageInfo() {
    try {
      await this.coverageInfoFileResolver.collectUncoveredCodeRegions();
    } catch (e) {
      throw new Error('Error: Could not find the file containing coverage information. ' +
        'Ensure \'cmake-llvm-coverage Cmake Target\' and/or \'cmake-llvm-coverage Coverage Info File Name\' ' +
        'settings are properly set.');
    }
  }

  private readonly cmakeProcess: CmakeProcess;
  private readonly buildTreeDirectoryResolver: BuildTreeDirectoryResolver;
  private readonly coverageInfoFileResolver: UncoveredCodeRegionsCollector;
}
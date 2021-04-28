import { CoverageDecorations } from '../value-objects/coverageDecorations';
import { CmakeProcess } from '../ports/cmakeProcess';
import { BuildTreeDirectoryResolver } from '../ports/buildTreeDirectoryResolver';
import { UncoveredCodeRegionsCollector } from '../ports/uncoveredCodeRegionsCollector';

export class DecorationLocationsProvider {
  constructor(
    cmakeProcess: CmakeProcess,
    buildTreeDirectoryResolver: BuildTreeDirectoryResolver,
    uncoveredCodeRegionsCollector: UncoveredCodeRegionsCollector) {
    this.cmakeProcess = cmakeProcess;
    this.buildTreeDirectoryResolver = buildTreeDirectoryResolver;
    this.uncoveredCodeRegionsCollector = uncoveredCodeRegionsCollector;
  }

  async getDecorationLocationsForUncoveredCodeRegions() {
    await Promise.all([
      this.buildTreeDirectoryResolver.resolveFullPath(),
      this.cmakeProcess.buildCmakeTarget()]);

    await this.uncoveredCodeRegionsCollector.collectUncoveredCodeRegions();

    return new class implements CoverageDecorations { };
  }

  private readonly cmakeProcess: CmakeProcess;
  private readonly buildTreeDirectoryResolver: BuildTreeDirectoryResolver;
  private readonly uncoveredCodeRegionsCollector: UncoveredCodeRegionsCollector;
}
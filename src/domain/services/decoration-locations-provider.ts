import { CoverageDecorations } from '../value-objects/coverage-decorations';
import { CmakeProcess } from '../ports/cmake-process';
import { BuildTreeDirectoryResolver } from '../ports/build-tree-directory-resolver';
import { UncoveredCodeRegionsCollector } from '../ports/uncovered-code-regions-collector';

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
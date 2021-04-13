import { Settings } from '../records/settings';
import { CoverageDecorations } from '../records/coverageDecorations';
import { CmakeProcess } from '../adapters/cmakeProcess';
import { BuildTreeDirectoryResolver } from '../adapters/buildTreeDirectoryResolver';
import { CoverageInfoFilesResolver } from '../adapters/coverageInfoFilesResolver';

export class DecorationLocationProvider {
  constructor(
    settings: Settings,
    cmakeProcess: CmakeProcess,
    buildTreeDirectoryResolver: BuildTreeDirectoryResolver,
    coverageInfoFileResolver: CoverageInfoFilesResolver) {
    this.settings = settings;
    this.cmakeProcess = cmakeProcess;
    this.buildTreeDirectoryResolver = buildTreeDirectoryResolver;
    this.coverageInfoFileResolver = coverageInfoFileResolver;
  }

  async obtainDecorationForUncoveredCodeRegions() {
    await Promise.all([
      this.checkCmakeCommand(),
      this.resolveBuildTreeDirectory(),
      this.buildCmakeTarget(),
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

  private async buildCmakeTarget() {
    try {
      await this.cmakeProcess.buildCmakeTarget();
    } catch (e) {
      throw new Error(`Error: Could not execute the specified cmake target \'${this.settings.cmakeTarget}\'. ` +
        'Ensure \'cmake-llvm-coverage Cmake Target\' setting is properly set.');
    }
  }

  private async resolveBuildTreeDirectory() {
    try {
      await this.buildTreeDirectoryResolver.findDirectory();
    } catch (e) {
      throw new Error('Error: Build tree directory cannot be found. ' +
        'Ensure \'cmake-llvm-coverage Build Tree Directory\' setting is properly set.');
    }
  }

  private async checkCmakeCommand() {
    try {
      await this.cmakeProcess.checkCmakeVersion();
    } catch (e) {
      throw new Error('Error: cmake command is not invocable. ' +
        'Ensure \'cmake-llvm-coverage Cmake Command\' setting is properly set.');
    };
  }

  private readonly cmakeProcess: CmakeProcess;
  private readonly settings: Settings;
  private readonly buildTreeDirectoryResolver: BuildTreeDirectoryResolver;
  private readonly coverageInfoFileResolver: CoverageInfoFilesResolver;
}
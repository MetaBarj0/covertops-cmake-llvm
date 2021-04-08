export type Settings = {
  cmakeCommand: string;
  buildTreeDirectory: string;
  cmakeTarget: string;
  coverageInfoFileNamePatterns: string[],
  cwd: string
};

export type CmakeProcess = {
  checkCmakeVersion(): Promise<string>;

  buildCmakeTarget(): Promise<void>;
};

export type BuildTreeDirectoryResolver = {
  resolve(): Promise<void>;
};

export type CoverageInfoFileResolver = {
  gatherCoverageInfo(): Promise<void>;
};

export class CoverageDecorations {
};

export class DecorationLocationProvider {
  constructor(
    settings: Settings,
    cmakeProcess: CmakeProcess,
    buildTreeDirectoryResolver: BuildTreeDirectoryResolver,
    coverageInfoFileResolver: CoverageInfoFileResolver) {
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

    return new CoverageDecorations();
  }

  private async gatherCoverageInfo() {
    try {
      await this.coverageInfoFileResolver.gatherCoverageInfo();
    } catch (e) {
      throw new Error('Error: Could not find any file containing coverage information using ' +
        'regular expression patterns provided in settings. ' +
        'Ensure \'cpp-llvm-coverage Cmake Target\' setting is properly set.');
    }
  }

  private async buildCmakeTarget() {
    try {
      await this.cmakeProcess.buildCmakeTarget();
    } catch (e) {
      throw new Error(`Error: Could not execute the specified cmake target \'${this.settings.cmakeTarget}\'. ` +
        'Ensure \'cpp-llvm-coverage Cmake Target\' setting is properly set.');
    }
  }

  private async resolveBuildTreeDirectory() {
    try {
      await this.buildTreeDirectoryResolver.resolve();
    } catch (e) {
      throw new Error('Error: Build tree directory cannot be found. ' +
        'Ensure \'cpp-llvm-coverage Build Tree Directory\' setting is properly set.');
    }
  }

  private async checkCmakeCommand() {
    try {
      await this.cmakeProcess.checkCmakeVersion();
    } catch (e) {
      throw new Error('Error: cmake command is not invocable. ' +
        'Ensure \'cpp-llvm-coverage Cmake Command\' setting is properly set.');
    };
  }

  private readonly cmakeProcess: CmakeProcess;
  private readonly settings: Settings;
  private readonly buildTreeDirectoryResolver: BuildTreeDirectoryResolver;
  private readonly coverageInfoFileResolver: CoverageInfoFileResolver;
}
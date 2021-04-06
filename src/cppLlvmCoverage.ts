export type Settings = {
  cmakeCommand: string;
  buildTreeDirectory: string;
  cmakeTarget: string;
  coverageInfoFileNamePatterns: string[],
  cwd: string
};

export type CmakeProcess = {
  cmakeCommand: string;

  checkCmakeVersion(): Promise<string>;

  buildCmakeTarget(): Promise<void>;
};

export type BuildTreeDirectoryResolver = {
  readonly path?: string;

  resolve(): Promise<void>;
};

export class CppLlvmCoverage {
  constructor(settings: Settings, cmakeProcess: CmakeProcess, buildTreeDirectoryResolver: BuildTreeDirectoryResolver) {
    this.settings = settings;
    this.cmakeProcess = cmakeProcess;
    this.buildTreeDirectoryResolver = buildTreeDirectoryResolver;
  }

  async obtainDecorationForUncoveredCodeRegions() {
    try {
      await this.cmakeProcess.checkCmakeVersion();
    } catch (e) {
      throw new Error('Error: cmake command is not invocable. ' +
        'Ensure \'cpp-llvm-coverage Cmake Command\' setting is properly set.');
    };

    try {
      await this.buildTreeDirectoryResolver.resolve();
    } catch (e) {
      throw new Error('Error: Build tree directory cannot be found. ' +
        'Ensure \'cpp-llvm-coverage Build Tree Directory\' setting is properly set.');
    }

    throw new Error(`Error: Could not execute the specified cmake target \'${this.settings.cmakeTarget}\'. ` +
      'Ensure \'cpp-llvm-coverage Cmake Target\' setting is properly set.');
  }

  private readonly cmakeProcess: CmakeProcess;
  private readonly settings: Settings;
  private readonly buildTreeDirectoryResolver;
}
import * as Types from "./types";

export function make(context: Context): Types.Modules.CoverageInfoProvider {
  return new CoverageInfoProvider({
    settings: context.settings,
    buildTreeDirectoryResolver: context.buildTreeDirectoryResolver,
    cmake: context.cmake,
    coverageInfoCollector: context.coverageInfoCollector
  });
}
class CoverageInfoProvider implements Types.Modules.CoverageInfoProvider {
  constructor(context: Context) {
    this.buildTreeDirectoryResolver = context.buildTreeDirectoryResolver;
    this.cmake = context.cmake;
    this.coverageInfoCollector = context.coverageInfoCollector;
  }

  async getCoverageInfoForFile(sourceFilePath: string) {
    await this.buildTreeDirectoryResolver.resolve();
    await this.cmake.buildTarget();

    return this.coverageInfoCollector.collectFor(sourceFilePath);
  }

  private readonly buildTreeDirectoryResolver: Types.Modules.BuildTreeDirectoryResolver;
  private readonly cmake: Types.Modules.Cmake;
  private readonly coverageInfoCollector: Types.Modules.CoverageInfoCollector;
}

type Context = {
  settings: Types.Modules.Settings,
  buildTreeDirectoryResolver: Types.Modules.BuildTreeDirectoryResolver,
  cmake: Types.Modules.Cmake,
  coverageInfoCollector: Types.Modules.CoverageInfoCollector
};

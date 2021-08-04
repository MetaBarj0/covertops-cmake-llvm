import * as Types from "../../../types";

export function make(context: Context): Types.Modules.CoverageInfoProvider.CoverageInfoProvider {
  return new CoverageInfoProvider({
    settings: context.settings,
    buildTreeDirectoryResolver: context.buildTreeDirectoryResolver,
    cmake: context.cmake,
    coverageInfoCollector: context.coverageInfoCollector
  });
}
class CoverageInfoProvider implements Types.Modules.CoverageInfoProvider.CoverageInfoProvider {
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

  private readonly buildTreeDirectoryResolver: Types.Modules.BuildTreeDirectoryResolver.BuildTreeDirectoryResolver;
  private readonly cmake: Types.Modules.Cmake.Cmake;
  private readonly coverageInfoCollector: Types.Modules.CoverageInfoCollector.CoverageInfoCollector;
}

type Context = {
  settings: Types.Modules.SettingsProvider.Settings,
  buildTreeDirectoryResolver: Types.Modules.BuildTreeDirectoryResolver.BuildTreeDirectoryResolver,
  cmake: Types.Modules.Cmake.Cmake,
  coverageInfoCollector: Types.Modules.CoverageInfoCollector.CoverageInfoCollector
};

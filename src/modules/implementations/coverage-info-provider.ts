import * as Types from "./types";

export function make(context: Context): Types.Modules.Abstractions.CoverageInfoProvider {
  return new CoverageInfoProvider({
    settings: context.settings,
    buildTreeDirectoryResolver: context.buildTreeDirectoryResolver,
    cmake: context.cmake,
    coverageInfoCollector: context.coverageInfoCollector
  });
}
class CoverageInfoProvider implements Types.Modules.Abstractions.CoverageInfoProvider {
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

  private readonly buildTreeDirectoryResolver: Types.Modules.Abstractions.BuildTreeDirectoryResolver;
  private readonly cmake: Types.Modules.Abstractions.Cmake;
  private readonly coverageInfoCollector: Types.Modules.Abstractions.CoverageInfoCollector;
}

type Context = {
  settings: Types.Modules.Abstractions.Settings,
  buildTreeDirectoryResolver: Types.Modules.Abstractions.BuildTreeDirectoryResolver,
  cmake: Types.Modules.Abstractions.Cmake,
  coverageInfoCollector: Types.Modules.Abstractions.CoverageInfoCollector
};

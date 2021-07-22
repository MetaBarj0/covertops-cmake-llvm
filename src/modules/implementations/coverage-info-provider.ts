import * as Imports from "./types";

export function make(context: Context): Imports.Modules.Abstractions.CoverageInfoProvider {
  return new CoverageInfoProvider({
    settings: context.settings,
    buildTreeDirectoryResolver: context.buildTreeDirectoryResolver,
    cmake: context.cmake,
    coverageInfoCollector: context.coverageInfoCollector
  });
}
class CoverageInfoProvider implements Imports.Modules.Abstractions.CoverageInfoProvider {
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

  private readonly buildTreeDirectoryResolver: Imports.Modules.Abstractions.BuildTreeDirectoryResolver;
  private readonly cmake: Imports.Modules.Abstractions.Cmake;
  private readonly coverageInfoCollector: Imports.Modules.Abstractions.CoverageInfoCollector;
}

type Context = {
  settings: Imports.Modules.Abstractions.Settings,
  buildTreeDirectoryResolver: Imports.Modules.Abstractions.BuildTreeDirectoryResolver,
  cmake: Imports.Modules.Abstractions.Cmake,
  coverageInfoCollector: Imports.Modules.Abstractions.CoverageInfoCollector
};

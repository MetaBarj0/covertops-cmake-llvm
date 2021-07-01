import * as Imports from '../imports';

export function make(context: Context): Imports.Abstractions.Domain.DecorationLocationsProvider {
  return new DecorationLocationsProvider({
    settings: context.settings,
    buildTreeDirectoryResolver: context.buildTreeDirectoryResolver,
    cmake: context.cmake,
    coverageInfoCollector: context.coverageInfoCollector
  });
}
class DecorationLocationsProvider implements Imports.Abstractions.Domain.DecorationLocationsProvider {
  constructor(context: Context) {
    this.buildTreeDirectoryResolver = context.buildTreeDirectoryResolver;
    this.cmake = context.cmake;
    this.coverageInfoCollector = context.coverageInfoCollector;
  }

  async getDecorationLocationsForUncoveredCodeRegions(sourceFilePath: string) {
    await this.buildTreeDirectoryResolver.resolve();
    await this.cmake.buildTarget();

    return this.coverageInfoCollector.collectFor(sourceFilePath);
  }

  private readonly buildTreeDirectoryResolver: Imports.Abstractions.Domain.BuildTreeDirectoryResolver;
  private readonly cmake: Imports.Abstractions.Domain.Cmake;
  private readonly coverageInfoCollector: Imports.Abstractions.Domain.CoverageInfoCollector;
}

type Context = {
  settings: Imports.Abstractions.Domain.Settings,
  buildTreeDirectoryResolver: Imports.Abstractions.Domain.BuildTreeDirectoryResolver,
  cmake: Imports.Abstractions.Domain.Cmake,
  coverageInfoCollector: Imports.Abstractions.Domain.CoverageInfoCollector
};
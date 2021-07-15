import * as Imports from '../imports';

export function make(context: Context): Imports.Domain.Abstractions.DecorationLocationsProvider {
  return new DecorationLocationsProvider({
    settings: context.settings,
    buildTreeDirectoryResolver: context.buildTreeDirectoryResolver,
    cmake: context.cmake,
    coverageInfoCollector: context.coverageInfoCollector
  });
}
class DecorationLocationsProvider implements Imports.Domain.Abstractions.DecorationLocationsProvider {
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

  private readonly buildTreeDirectoryResolver: Imports.Domain.Abstractions.BuildTreeDirectoryResolver;
  private readonly cmake: Imports.Domain.Abstractions.Cmake;
  private readonly coverageInfoCollector: Imports.Domain.Abstractions.CoverageInfoCollector;
}

type Context = {
  settings: Imports.Domain.Abstractions.Settings,
  buildTreeDirectoryResolver: Imports.Domain.Abstractions.BuildTreeDirectoryResolver,
  cmake: Imports.Domain.Abstractions.Cmake,
  coverageInfoCollector: Imports.Domain.Abstractions.CoverageInfoCollector
};
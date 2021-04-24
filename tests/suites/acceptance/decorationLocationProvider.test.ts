import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import { DecorationLocationsProvider } from '../../../src/services/decorationLocationsProvider';

import {
  buildFakeCmakeProcess,
  buildSucceedingCmakeProcess,
  buildFailingCmakeProcessForUnreachableCmake,
  buildFailingCmakeProcessForBadTarget,
} from './fakes/cmakeProcess.fake';

import {
  buildFakeBuildTreeDirectoryResolver,
  buildSucceedingBuildTreeDirectoryResolver,
  buildFailingBuildTreeDirectoryResolver
} from './fakes/buildTreeDirectoryResolver.fake';

import {
  buildFakeUncoveredCodeRegionsCollector,
  buildFailingUncoveredCodeRegionsCollector,
  buildSucceedingUncoveredCodeRegionsCollector
} from './fakes/uncoveredCodeRegionsCollector.fake';

describe('DecorationLocationProvider service behavior.', () => {
  it('should be correctly instantiated with faked adapters.', () => {
    (() => {
      new DecorationLocationsProvider(
        buildFakeCmakeProcess(),
        buildFakeBuildTreeDirectoryResolver(),
        buildFakeUncoveredCodeRegionsCollector());
    }).should.not.throw();
  });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake command cannot be reached.',
    () => {
      const cmakeProcess = buildFailingCmakeProcessForUnreachableCmake();
      const buildTreeDirectoryResolver = buildSucceedingBuildTreeDirectoryResolver();
      const coverageInfoFileResolver = buildSucceedingUncoveredCodeRegionsCollector();

      const provider = new DecorationLocationsProvider(cmakeProcess, buildTreeDirectoryResolver, coverageInfoFileResolver);

      return provider.getDecorationLocationsForUncoveredCodeRegions().should.eventually.be.rejectedWith(
        "Cannot find the cmake command. Ensure the 'cmake-llvm-coverage Cmake Command' " +
        'setting is correctly set. Have you verified your PATH environment variable?');
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the build tree directory can not be found though cmake command ' +
    'is invocable',
    () => {
      const cmakeProcess = buildSucceedingCmakeProcess();
      const buildTreeDirectoryResolver = buildFailingBuildTreeDirectoryResolver();
      const coverageInfoFileResolver = buildSucceedingUncoveredCodeRegionsCollector();

      const provider = new DecorationLocationsProvider(cmakeProcess, buildTreeDirectoryResolver, coverageInfoFileResolver);

      return provider.getDecorationLocationsForUncoveredCodeRegions().should.eventually.be.rejectedWith(
        'Error: Build tree directory cannot be found. ' +
        'Ensure \'cmake-llvm-coverage Build Tree Directory\' setting is properly set.');
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake target cannot be run by cmake though the cmake command is invocable and ' +
    'the build tree directory exists.',
    () => {
      const cmakeProcess = buildFailingCmakeProcessForBadTarget();
      const buildDirectoryResolver = buildSucceedingBuildTreeDirectoryResolver();
      const coverageInfoFileResolver = buildSucceedingUncoveredCodeRegionsCollector();

      const provider = new DecorationLocationsProvider(cmakeProcess, buildDirectoryResolver, coverageInfoFileResolver);

      return provider.getDecorationLocationsForUncoveredCodeRegions().should.eventually.be.rejectedWith(
        'Error: Could not build the specified cmake target. ' +
        "Ensure 'cmake-llvm-coverage Cmake Target' setting is properly set.");
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the coverage info file name does not target an existing file',
    () => {
      const cmakeProcess = buildSucceedingCmakeProcess();
      const buildDirectoryResolver = buildSucceedingBuildTreeDirectoryResolver();
      const failingCoverageInfoFileResolver = buildFailingUncoveredCodeRegionsCollector();

      const provider = new DecorationLocationsProvider(cmakeProcess, buildDirectoryResolver, failingCoverageInfoFileResolver);

      return provider.getDecorationLocationsForUncoveredCodeRegions().should.eventually.be.rejectedWith(
        'Error: Could not find the file containing coverage information. ' +
        'Ensure \'cmake-llvm-coverage Cmake Target\' and/or \'cmake-llvm-coverage Coverage Info File Name\' ' +
        'settings are properly set.');
    });

  it('should be able to provide decoration for uncovered code regions ' +
    'when all adapters work as expected.',
    () => {
      const cmakeProcess = buildSucceedingCmakeProcess();
      const buildDirectoryResolver = buildSucceedingBuildTreeDirectoryResolver();
      const failingCoverageInfoFileResolver = buildSucceedingUncoveredCodeRegionsCollector();

      const provider = new DecorationLocationsProvider(cmakeProcess, buildDirectoryResolver, failingCoverageInfoFileResolver);

      return provider.getDecorationLocationsForUncoveredCodeRegions().should.eventually.be.fulfilled;
    });
});
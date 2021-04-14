import * as chai from 'chai';
import * as mocha from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

const describe = mocha.describe;
const it = mocha.it;

import { DecorationLocationProvider } from '../../../src/services/decorationLocationProvider';

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
  buildFakeCoverageInfoFileResolver,
  buildFailingCoverageInfoFileResolver,
  buildSucceedingCoverageInfoFileResolver
} from './fakes/coverageInfoFileResolver.fake';

describe('DecorationLocationProvider service behavior.', () => {
  it('should be correctly instantiated with faked services and records.', () => {
    (() => {
      new DecorationLocationProvider(
        buildFakeCmakeProcess(),
        buildFakeBuildTreeDirectoryResolver(),
        buildFakeCoverageInfoFileResolver());
    }).should.not.throw();
  });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake command cannot be reached.',
    () => {
      const cmakeProcess = buildFailingCmakeProcessForUnreachableCmake();
      const buildTreeDirectoryResolver = buildSucceedingBuildTreeDirectoryResolver();
      const coverageInfoFileResolver = buildSucceedingCoverageInfoFileResolver();

      const provider = new DecorationLocationProvider(cmakeProcess, buildTreeDirectoryResolver, coverageInfoFileResolver);

      return provider.obtainDecorationForUncoveredCodeRegions().should.eventually.be.rejectedWith(
        "Cannot find the cmake command. Ensure the 'cmake-llvm-coverage Cmake Command' " +
        'setting is correctly set. Have you verified your PATH environment variable?');
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the build tree directory can not be found though cmake command ' +
    'is invocable',
    () => {
      const cmakeProcess = buildSucceedingCmakeProcess();
      const buildTreeDirectoryResolver = buildFailingBuildTreeDirectoryResolver();
      const coverageInfoFileResolver = buildSucceedingCoverageInfoFileResolver();

      const provider = new DecorationLocationProvider(cmakeProcess, buildTreeDirectoryResolver, coverageInfoFileResolver);

      return provider.obtainDecorationForUncoveredCodeRegions().should.eventually.be.rejectedWith(
        'Error: Build tree directory cannot be found. ' +
        'Ensure \'cmake-llvm-coverage Build Tree Directory\' setting is properly set.');
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake target cannot be run by cmake.',
    () => {
      const cmakeProcess = buildFailingCmakeProcessForBadTarget();
      const buildDirectoryResolver = buildSucceedingBuildTreeDirectoryResolver();
      const coverageInfoFileResolver = buildSucceedingCoverageInfoFileResolver();

      const provider = new DecorationLocationProvider(cmakeProcess, buildDirectoryResolver, coverageInfoFileResolver);

      return provider.obtainDecorationForUncoveredCodeRegions().should.eventually.be.rejectedWith(
        'Error: Could not build the specified cmake target. ' +
        "Ensure 'cmake-llvm-coverage Cmake Target' setting is properly set.");
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when regular expression patterns for file name containing coverage info ' +
    'do not lead to find files containing coverage information',
    () => {
      const cmakeProcess = buildSucceedingCmakeProcess();
      const buildDirectoryResolver = buildSucceedingBuildTreeDirectoryResolver();
      const failingCoverageInfoFileResolver = buildFailingCoverageInfoFileResolver();

      const provider = new DecorationLocationProvider(cmakeProcess, buildDirectoryResolver, failingCoverageInfoFileResolver);

      return provider.obtainDecorationForUncoveredCodeRegions().should.eventually.be.rejectedWith(
        'Error: Could not find any file containing coverage information using ' +
        'regular expression patterns provided in settings. ' +
        'Ensure \'cmake-llvm-coverage Cmake Target\' setting is properly set.');
    });

  it('should be able to provide decoration for uncovered code regions ' +
    'when all settings are properly set and are meaningful.',
    () => {
      const cmakeProcess = buildSucceedingCmakeProcess();
      const buildDirectoryResolver = buildSucceedingBuildTreeDirectoryResolver();
      const failingCoverageInfoFileResolver = buildSucceedingCoverageInfoFileResolver();

      const provider = new DecorationLocationProvider(cmakeProcess, buildDirectoryResolver, failingCoverageInfoFileResolver);

      return provider.obtainDecorationForUncoveredCodeRegions().should.eventually.be.fulfilled;
    });
});
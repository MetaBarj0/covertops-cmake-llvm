import * as chai from 'chai';
import * as mocha from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

const describe = mocha.describe;
const it = mocha.it;

import { DecorationLocationProvider } from '../../../service';

import {
  buildInvalidCmakeCommandSetting,
  buildInvalidBuildTreeDirectorySetting,
  buildInvalidCmakeTargetSetting,
  buildInvalidCoverageInfoFileNamePatternsSettings,
  buildFakeSettings
} from './settings.builder';

import {
  buildFakeCmakeProcess,
  buildSucceedingCmakeProcess,
  buildFailingCmakeProcessForCmakeCommandCheck,
  buildFailingCmakeProcessForTargetBuilding
} from './builders/cmakeProcess.builder';

import {
  buildFakeBuildTreeDirectoryResolver,
  buildSucceedingBuildTreeDirectoryResolver,
  buildFailingBuildTreeDirectoryResolver
} from './builders/buildTreeDirectoryResolver.builder';

import {
  buildFakeCoverageInfoFileResolver,
  buildFailingCoverageInfoFileResolver,
  buildSucceedingCoverageInfoFileResolver
} from './builders/coverageInfoFileResolver.builder';

describe('Extension behavior regarding extension settings', () => {
  it('should be correctly instantiated with injected dependencies.', () => {
    (() => {
      new DecorationLocationProvider(
        buildFakeSettings(),
        buildFakeCmakeProcess(),
        buildFakeBuildTreeDirectoryResolver(),
        buildFakeCoverageInfoFileResolver());
    }).should.not.throw();
  });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake command does not execute cmake properly.',
    () => {
      const settings = buildInvalidCmakeCommandSetting();
      const cmakeProcess = buildFailingCmakeProcessForCmakeCommandCheck();
      const buildTreeDirectoryResolver = buildSucceedingBuildTreeDirectoryResolver();
      const coverageInfoFileResolver = buildSucceedingCoverageInfoFileResolver();

      const clc = new DecorationLocationProvider(settings, cmakeProcess, buildTreeDirectoryResolver, coverageInfoFileResolver);

      return clc.obtainDecorationForUncoveredCodeRegions().should.eventually.be.rejectedWith(
        'Error: cmake command is not invocable. ' +
        'Ensure \'cpp-llvm-coverage Cmake Command\' setting is properly set.');
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the build tree directory can not be found though cmake command ' +
    'is invocable',
    () => {
      const settings = buildInvalidBuildTreeDirectorySetting();
      const cmakeProcess = buildSucceedingCmakeProcess();
      const buildTreeDirectoryResolver = buildFailingBuildTreeDirectoryResolver();
      const coverageInfoFileResolver = buildSucceedingCoverageInfoFileResolver();

      const clc = new DecorationLocationProvider(settings, cmakeProcess, buildTreeDirectoryResolver, coverageInfoFileResolver);

      return clc.obtainDecorationForUncoveredCodeRegions().should.eventually.be.rejectedWith(
        'Error: Build tree directory cannot be found. ' +
        'Ensure \'cpp-llvm-coverage Build Tree Directory\' setting is properly set.');
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake target cannot be run by cmake.',
    () => {
      const settings = buildInvalidCmakeTargetSetting();
      const cmakeProcess = buildFailingCmakeProcessForTargetBuilding();
      const buildDirectoryResolver = buildSucceedingBuildTreeDirectoryResolver();
      const coverageInfoFileResolver = buildSucceedingCoverageInfoFileResolver();

      const clc = new DecorationLocationProvider(settings, cmakeProcess, buildDirectoryResolver, coverageInfoFileResolver);

      return clc.obtainDecorationForUncoveredCodeRegions().should.eventually.be.rejectedWith(
        `Error: Could not execute the specified cmake target '${settings.cmakeTarget}'. ` +
        'Ensure \'cpp-llvm-coverage Cmake Target\' setting is properly set.');
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when regular expression patterns for file name containing coverage info ' +
    'do not lead to find files containing coverage information',
    () => {
      const settings = buildInvalidCoverageInfoFileNamePatternsSettings();
      const cmakeProcess = buildSucceedingCmakeProcess();
      const buildDirectoryResolver = buildSucceedingBuildTreeDirectoryResolver();
      const failingCoverageInfoFileResolver = buildFailingCoverageInfoFileResolver();

      const clc = new DecorationLocationProvider(settings, cmakeProcess, buildDirectoryResolver, failingCoverageInfoFileResolver);

      return clc.obtainDecorationForUncoveredCodeRegions().should.eventually.be.rejectedWith(
        'Error: Could not find any file containing coverage information using ' +
        'regular expression patterns provided in settings. ' +
        'Ensure \'cpp-llvm-coverage Cmake Target\' setting is properly set.');
    });

  it('should be able to provide decoration for uncovered code regions ' +
    'when all settings are properly set and are meaningful.',
    () => {
      const settings = buildFakeSettings();
      const cmakeProcess = buildSucceedingCmakeProcess();
      const buildDirectoryResolver = buildSucceedingBuildTreeDirectoryResolver();
      const failingCoverageInfoFileResolver = buildSucceedingCoverageInfoFileResolver();

      const clc = new DecorationLocationProvider(settings, cmakeProcess, buildDirectoryResolver, failingCoverageInfoFileResolver);

      return clc.obtainDecorationForUncoveredCodeRegions().should.eventually.be.fulfilled;
    });
});
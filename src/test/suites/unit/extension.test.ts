import * as chai from 'chai';
import * as mocha from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

const describe = mocha.describe;
const it = mocha.it;
const expect = chai.expect;
const should = chai.should();

import { CppLlvmCoverage } from '../../../cppLlvmCoverage';

import {
  buildInvalidCmakeCommandSetting,
  buildInvalidBuildTreeDirectorySetting,
  buildInvalidCmakeTargetSetting,
  buildAnySettings
} from './settings.builder';

import {
  buildAnyCmakeProcess,
  buildSucceedingCmakeProcess,
  buildFailingCmakeProcess,
  buildFailingCmakeProcessForTargetBuilding
} from './cmakeProcess.builder';

import {
  buildAnyBuildTreeDirectoryResolver,
  buildSucceedingBuildTreeDirectoryResolver,
  buildFailingBuildTreeDirectoryResolver
} from './buildTreeDirectoryResolver.builder';

describe('Extension behavior regarding extension settings and command executor', () => {
  it('should be correctly instantiated with injected dependencies.', () => {
    should.not.throw(() => {
      new CppLlvmCoverage(buildAnySettings(), buildAnyCmakeProcess(), buildAnyBuildTreeDirectoryResolver());
    });
  });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake command does not execute cmake properly.',
    async () => {
      const settings = buildInvalidCmakeCommandSetting();
      const cmakeProcess = buildFailingCmakeProcess();
      const buildTreeDirectoryResolver = buildSucceedingBuildTreeDirectoryResolver();

      const clc = new CppLlvmCoverage(settings, cmakeProcess, buildTreeDirectoryResolver);

      await expect(clc.obtainDecorationForUncoveredCodeRegions()).to.be.rejectedWith(
        'Error: cmake command is not invocable. ' +
        'Ensure \'cpp-llvm-coverage Cmake Command\' setting is properly set.');
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the build tree directory can not be found though cmake command ' +
    'is invocable',
    async () => {
      const settings = buildInvalidBuildTreeDirectorySetting();
      const cmakeProcess = buildSucceedingCmakeProcess();
      const buildTreeDirectoryResolver = buildFailingBuildTreeDirectoryResolver();

      const clc = new CppLlvmCoverage(settings, cmakeProcess, buildTreeDirectoryResolver);

      await expect(clc.obtainDecorationForUncoveredCodeRegions()).to.be.rejectedWith(
        'Error: Build tree directory cannot be found. ' +
        'Ensure \'cpp-llvm-coverage Build Tree Directory\' setting is properly set.');
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake target cannot be run by cmake.',
    async () => {
      const settings = buildInvalidCmakeTargetSetting();
      const cmakeProcess = buildFailingCmakeProcessForTargetBuilding();
      const buildDirectoryResolver = buildSucceedingBuildTreeDirectoryResolver();

      const clc = new CppLlvmCoverage(settings, cmakeProcess, buildDirectoryResolver);

      await expect(clc.obtainDecorationForUncoveredCodeRegions()).to.be.rejectedWith(
        `Error: Could not execute the specified cmake target \'${settings.cmakeTarget}\'. ` +
        'Ensure \'cpp-llvm-coverage Cmake Target\' setting is properly set.');
    });
});
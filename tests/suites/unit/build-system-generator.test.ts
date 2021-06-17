import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as definitions from '../../../src/definitions';
import * as BuildSystemGenerator from '../../../src/domain/services/internal/build-system-generator';

import { process as p } from '../../faked-adapters/process';
import { vscodeWorkspace as v } from '../../faked-adapters/vscode-workspace';
import { progressReporter as pr } from '../../faked-adapters/progress-reporter';

describe('Unit test suite', () => {
  describe('the build system generator behavior', () => {
    describe('the build system failing in building a target with a wrong cmake command setting', buildSystemGeneratorShouldFailWithWrongCmakeCommandSetting);
    describe('the build system failing in building a target with a wrong cmake target setting', buildSystemGeneratorShouldFailWithWrongCmakeTargetSetting);
    describe('the build system succeeding in building a target with correct settings', buildSystemGeneratorShouldSucceedWithCorrectSettings);
  });
});

function buildSystemGeneratorShouldFailWithWrongCmakeCommandSetting() {
  it('should be instantiated but fails when asking for building a target', () => {
    const workspace = v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ 'cmakeCommand': '' });
    const processForCommand = p.buildFakeFailingProcess();
    const processForTarget = p.buildFakeSucceedingProcess();
    const progressReporter = pr.buildFakeProgressReporter();

    const cmake = BuildSystemGenerator.make({
      workspace,
      processForCommand,
      processForTarget,
      progressReporter
    });

    return cmake.buildTarget().should.eventually.be.rejectedWith(
      `Cannot find the cmake command. Ensure the '${definitions.extensionNameInSettings}: Cmake Command' ` +
      'setting is correctly set. Have you verified your PATH environment variable?');
  });
}

function buildSystemGeneratorShouldFailWithWrongCmakeTargetSetting() {
  it('should be instantiated but throw when asking for building a target', () => {
    const workspace = v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ 'cmakeTarget': '' });
    const processForCommand = p.buildFakeSucceedingProcess();
    const processForTarget = p.buildFakeFailingProcess();
    const progressReporter = pr.buildFakeProgressReporter();

    const cmake = BuildSystemGenerator.make({
      workspace,
      processForCommand,
      processForTarget,
      progressReporter
    });

    const target = workspace.getConfiguration(definitions.extensionNameInSettings).get('cmakeTarget');

    return cmake.buildTarget().should.eventually.be.rejectedWith(
      `Error: Could not build the specified cmake target ${target}. ` +
      `Ensure '${definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`);
  });
}

function buildSystemGeneratorShouldSucceedWithCorrectSettings() {
  it('should be instantiated and succeed when asking for building a target', () => {
    const workspace = v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const processForCommand = p.buildFakeSucceedingProcess();
    const processForTarget = p.buildFakeSucceedingProcess();
    const progressReporter = pr.buildFakeProgressReporter();

    const cmake = BuildSystemGenerator.make({
      workspace,
      processForCommand,
      processForTarget,
      progressReporter
    });

    return cmake.buildTarget().should.eventually.be.fulfilled;
  });
}
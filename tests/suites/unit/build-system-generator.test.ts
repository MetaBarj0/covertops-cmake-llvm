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
import { errorChannel as e } from '../../faked-adapters/error-channel';

describe('Unit test suite', () => {
  describe('the build system generator behavior', () => {
    describe('the build system failing in building a target with a wrong cmake command setting', buildSystemGeneratorShouldFailWithWrongCmakeCommandSetting);
    describe('the build system failing in building a target with a wrong cmake target setting', buildSystemGeneratorShouldFailWithWrongCmakeTargetSetting);
    describe('the build system succeeding in building a target with correct settings', buildSystemGeneratorShouldSucceedWithCorrectSettings);
  });
});

function buildSystemGeneratorShouldFailWithWrongCmakeCommandSetting() {
  it('should be instantiated but fails when asking for building a target and reports to error channel', () => {
    const workspace = v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ 'cmakeCommand': '' });
    const processForCommand = p.buildFakeFailingProcess();
    const processForTarget = p.buildFakeSucceedingProcess();
    const progressReporter = pr.buildFakeProgressReporter();
    const errorChannelSpy = e.buildSpyOfErrorChannel(e.buildFakeErrorChannel());
    const errorChannel = errorChannelSpy.object;

    const cmake = BuildSystemGenerator.make({
      workspace,
      processForCommand,
      processForTarget,
      progressReporter,
      errorChannel
    });

    return cmake.buildTarget()
      .catch((error: Error) => {
        error.message.should.contain(
          `Cannot find the cmake command. Ensure the '${definitions.extensionNameInSettings}: Cmake Command' ` +
          'setting is correctly set. Have you verified your PATH environment variable?');

        errorChannelSpy.countFor('appendLine').should.be.equal(1);
      });
  });
}

function buildSystemGeneratorShouldFailWithWrongCmakeTargetSetting() {
  it('should be instantiated but throw when asking for building a target and reports in error channel', () => {
    const workspace = v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ 'cmakeTarget': '' });
    const processForCommand = p.buildFakeSucceedingProcess();
    const processForTarget = p.buildFakeFailingProcess();
    const progressReporter = pr.buildFakeProgressReporter();
    const errorChannelSpy = e.buildSpyOfErrorChannel(e.buildFakeErrorChannel());
    const errorChannel = errorChannelSpy.object;

    const cmake = BuildSystemGenerator.make({
      workspace,
      processForCommand,
      processForTarget,
      progressReporter,
      errorChannel
    });

    const target = workspace.getConfiguration(definitions.extensionNameInSettings).get('cmakeTarget');

    return cmake.buildTarget()
      .catch((error: Error) => {
        error.message.should.contain(
          `Error: Could not build the specified cmake target ${target}. ` +
          `Ensure '${definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`);

        errorChannelSpy.countFor('appendLine').should.be.equal(1);
      });
    ;
  });
}

function buildSystemGeneratorShouldSucceedWithCorrectSettings() {
  it('should be instantiated and succeed when asking for building a target in three discrete steps', async () => {
    const workspace = v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const processForCommand = p.buildFakeSucceedingProcess();
    const processForTarget = p.buildFakeSucceedingProcess();
    const progressReporterSpy = pr.buildSpyOfProgressReporter(pr.buildFakeProgressReporter());
    const progressReporter = progressReporterSpy.object;
    const errorChannel = e.buildFakeErrorChannel();

    const cmake = BuildSystemGenerator.make({
      workspace,
      processForCommand,
      processForTarget,
      progressReporter,
      errorChannel
    });

    await cmake.buildTarget();

    progressReporterSpy.countFor('report').should.be.equal(3);
  });
}
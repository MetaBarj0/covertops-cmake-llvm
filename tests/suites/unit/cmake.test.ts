import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as Imports from './imports';

describe('Unit test suite', () => {
  describe('cmake behavior', () => {
    describe('cmake failing in building a target with a wrong cmake command setting', cmakeShouldFailWithWrongCmakeCommandSetting);
    describe('cmake failing in building a target with a wrong cmake target setting', cmakeShouldFailWithWrongCmakeTargetSetting);
    describe('cmake succeeding in building a target with correct settings', cmakeShouldSucceedWithCorrectSettings);
  });
});

function cmakeShouldFailWithWrongCmakeCommandSetting() {
  it('should be instantiated but fails when asking for building a target and reports to error channel', () => {
    const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ 'cmakeCommand': '' });
    const errorChannelSpy = Imports.Fakes.Adapters.vscode.buildSpyOfErrorChannel(Imports.Fakes.Adapters.vscode.buildFakeErrorChannel());
    const errorChannel = errorChannelSpy.object;
    const settings = Imports.Domain.Implementations.SettingsProvider.make({ errorChannel, workspace }).settings;
    const processForCommand = Imports.Fakes.Adapters.ProcessControl.buildFakeFailingProcess();
    const processForTarget = Imports.Fakes.Adapters.ProcessControl.buildFakeSucceedingProcess();
    const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();

    const cmake = Imports.Domain.Implementations.Cmake.make({
      settings,
      processControl: {
        execFileForCommand: processForCommand,
        execFileForTarget: processForTarget,
      },
      vscode: {
        progressReporter,
        errorChannel
      }
    });

    return cmake.buildTarget()
      .catch((error: Error) => {
        error.message.should.contain(
          `Cannot find the cmake command. Ensure the '${Imports.Extension.Definitions.extensionNameInSettings}: Cmake Command' ` +
          'setting is correctly set. Have you verified your PATH environment variable?');

        errorChannelSpy.countFor('appendLine').should.be.equal(1);
      });
  });
}

function cmakeShouldFailWithWrongCmakeTargetSetting() {
  it('should be instantiated but throw when asking for building a target and reports in error channel', () => {
    const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ 'cmakeTarget': '' });
    const errorChannelSpy = Imports.Fakes.Adapters.vscode.buildSpyOfErrorChannel(Imports.Fakes.Adapters.vscode.buildFakeErrorChannel());
    const errorChannel = errorChannelSpy.object;
    const settings = Imports.Domain.Implementations.SettingsProvider.make({ errorChannel, workspace }).settings;
    const processForCommand = Imports.Fakes.Adapters.ProcessControl.buildFakeSucceedingProcess();
    const processForTarget = Imports.Fakes.Adapters.ProcessControl.buildFakeFailingProcess();
    const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();

    const cmake = Imports.Domain.Implementations.Cmake.make({
      settings,
      processControl: {
        execFileForCommand: processForCommand,
        execFileForTarget: processForTarget,
      },
      vscode: {
        progressReporter,
        errorChannel
      }
    });

    const target = workspace.getConfiguration(Imports.Extension.Definitions.extensionNameInSettings).get('cmakeTarget');

    return cmake.buildTarget()
      .catch((error: Error) => {
        error.message.should.contain(
          `Error: Could not build the specified cmake target ${target}. ` +
          `Ensure '${Imports.Extension.Definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`);

        errorChannelSpy.countFor('appendLine').should.be.equal(1);
      });
    ;
  });
}

function cmakeShouldSucceedWithCorrectSettings() {
  it('should be instantiated and succeed when asking for building a target in three discrete steps', async () => {
    const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const errorChannel = Imports.Fakes.Adapters.vscode.buildFakeErrorChannel();
    const settings = Imports.Domain.Implementations.SettingsProvider.make({ errorChannel, workspace }).settings;
    const processForCommand = Imports.Fakes.Adapters.ProcessControl.buildFakeSucceedingProcess();
    const processForTarget = Imports.Fakes.Adapters.ProcessControl.buildFakeSucceedingProcess();
    const progressReporterSpy = Imports.Fakes.Adapters.vscode.buildSpyOfProgressReporter(Imports.Fakes.Adapters.vscode.buildFakeProgressReporter());
    const progressReporter = progressReporterSpy.object;

    const cmake = Imports.Domain.Implementations.Cmake.make({
      settings,
      vscode: {
        progressReporter,
        errorChannel
      },
      processControl: {
        execFileForCommand: processForCommand,
        execFileForTarget: processForTarget,
      }
    });

    await cmake.buildTarget();

    progressReporterSpy.countFor('report').should.be.equal(3);
  });
}
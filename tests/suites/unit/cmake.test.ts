import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as Imports from './imports';

describe('Unit test suite', () => {
  describe('cmake behavior', () => {
    describe('cmake failing because of a cmake command that is unreachable', cmakeShouldFailBecauseCmakeCommandIsUnreachable);
    describe('cmake failing at generating the project', cmakeShouldFailBecauseItCannotGenerateTheProject);
    describe('cmake failing at building a target', cmakeShouldFailBecauseItCannotBuildATarget);
    describe('cmake succeeding in building a target with correct settings', cmakeShouldSucceedWithCorrectSettings);
  });
});

function cmakeShouldFailBecauseCmakeCommandIsUnreachable() {
  it('should fail and reports to error channel if the cmake command is not reachable', () => {
    const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ 'cmakeCommand': '' });
    const errorChannelSpy = Imports.Fakes.Adapters.vscode.buildSpyOfErrorChannel(Imports.Fakes.Adapters.vscode.buildFakeErrorChannel());
    const errorChannel = errorChannelSpy.object;
    const settings = Imports.Domain.Implementations.SettingsProvider.make({ errorChannel, workspace }).settings;
    const execFile = Imports.Fakes.Adapters.ProcessControl.buildFakeFailingProcess();
    const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();

    const cmake = Imports.Fakes.Domain.buildUnreachableCmake({
      settings,
      progressReporter,
      errorChannel,
      execFile
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

function cmakeShouldFailBecauseItCannotGenerateTheProject() {
  it('should fail and report in error channel if a falure occurs at project generation stage', () => {
    const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ 'rootDirectory': 'not a cmake project folder' });
    const errorChannelSpy = Imports.Fakes.Adapters.vscode.buildSpyOfErrorChannel(Imports.Fakes.Adapters.vscode.buildFakeErrorChannel());
    const errorChannel = errorChannelSpy.object;
    const settings = Imports.Domain.Implementations.SettingsProvider.make({ errorChannel, workspace }).settings;
    const execFile = Imports.Fakes.Adapters.ProcessControl.buildFakeSucceedingProcess();
    const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();

    const cmake = Imports.Fakes.Domain.buildCmakeFailingAtGeneratingProject({
      settings,
      progressReporter,
      errorChannel,
      execFile
    });

    return cmake.buildTarget()
      .catch((error: Error) => {
        error.message.should.contain('Cannot generate the cmake project in the ' +
          `${settings.rootDirectory} directory. ` +
          'Ensure either you have opened a valid cmake project, or the cmake project has not already been generated using different options. ' +
          `You may have to take a look in '${Imports.Extension.Definitions.extensionNameInSettings}: Additional Cmake Options' settings ` +
          'and check the generator used is correct for instance.'
        );

        errorChannelSpy.countFor('appendLine').should.be.equal(1);
      });
    ;
  });
}

function cmakeShouldFailBecauseItCannotBuildATarget() {
  it('should fail and reports in error channel if a failure occurs in target building', () => {
    const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ 'cmakeTarget': 'very bad target' });
    const errorChannelSpy = Imports.Fakes.Adapters.vscode.buildSpyOfErrorChannel(Imports.Fakes.Adapters.vscode.buildFakeErrorChannel());
    const errorChannel = errorChannelSpy.object;
    const settings = Imports.Domain.Implementations.SettingsProvider.make({ errorChannel, workspace }).settings;
    const execFile = Imports.Fakes.Adapters.ProcessControl.buildFakeSucceedingProcess();
    const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();

    const cmake = Imports.Fakes.Domain.buildCmakeFailingAtBuildingTarget({
      settings,
      progressReporter,
      errorChannel,
      execFile
    });

    return cmake.buildTarget()
      .catch((error: Error) => {
        error.message.should.contain(
          `Error: Could not build the specified cmake target ${settings.cmakeTarget}. ` +
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
    const execFile = Imports.Fakes.Adapters.ProcessControl.buildFakeSucceedingProcess();
    const progressReporterSpy = Imports.Fakes.Adapters.vscode.buildSpyOfProgressReporter(Imports.Fakes.Adapters.vscode.buildFakeProgressReporter());
    const progressReporter = progressReporterSpy.object;

    const cmake = Imports.Fakes.Domain.buildFakeSucceedingCmake({
      settings,
      progressReporter,
      errorChannel,
      execFile
    });

    await cmake.buildTarget();

    progressReporterSpy.countFor('report').should.be.equal(3);
  });
}
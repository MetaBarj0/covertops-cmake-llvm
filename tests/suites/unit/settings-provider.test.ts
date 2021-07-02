import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as Imports from './imports';

describe('Unit test suite', () => {
  describe('The setting provider behavior', () => {
    describe('With a workspace that is not loaded, that is, no root folder', shouldFailBecauseOfNoRootFolderOpened);
    describe('With a loaded workspace, having a loaded root folder', shouldSucceedAndExposeDefaultSettings);
  });
});

function shouldFailBecauseOfNoRootFolderOpened() {
  it('should be instantiated correctly but throw an exception and report in error channel when workspace folders are not set', () => {
    const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithoutWorkspaceFolderAndWithoutSettings();
    const errorChannelSpy = Imports.Fakes.Adapters.vscode.buildSpyOfErrorChannel(Imports.Fakes.Adapters.vscode.buildFakeErrorChannel());
    const errorChannel = errorChannelSpy.object;

    const provider = Imports.Domain.Implementations.SettingsProvider.make({ workspace, errorChannel });

    const errorMessage = 'A workspace must be loaded to get coverage information.';

    (() => { provider.settings; }).should.throw(errorMessage);

    errorChannelSpy.countFor('appendLine').should.be.equal(1);
  });
}

function shouldSucceedAndExposeDefaultSettings() {
  it('should be instantiated correctly with a vscode workspace-like instance and provide ' +
    'settings with correct default values', () => {
      const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
      const errorChannel = Imports.Fakes.Adapters.vscode.buildFakeErrorChannel();

      const provider = Imports.Domain.Implementations.SettingsProvider.make({ workspace, errorChannel });
      const settings = provider.settings;

      settings.additionalCmakeOptions.should.be.empty;
      settings.buildTreeDirectory.should.be.equal(Imports.TestUtils.defaultSetting('buildTreeDirectory'));
      settings.cmakeCommand.should.be.equal(Imports.TestUtils.defaultSetting('cmakeCommand'));
      settings.cmakeTarget.should.be.equal(Imports.TestUtils.defaultSetting('cmakeTarget'));
      settings.coverageInfoFileName.should.be.equal(Imports.TestUtils.defaultSetting('coverageInfoFileName'));

      settings.rootDirectory.should.be.equal(Imports.TestUtils.defaultSetting('rootDirectory'));
    });
}

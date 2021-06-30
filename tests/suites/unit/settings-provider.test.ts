import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import { defaultSetting } from '../../utils/settings';

import * as SettingsProvider from '../../../src/modules/settings-provider/domain/settings-provider';

import * as vscode from '../../fakes/adapters/vscode';
import { errorChannel as e } from '../../fakes/adapters/error-channel';

describe('Unit test suite', () => {
  describe('The setting provider behavior', () => {
    describe('With a workspace that is not loaded, that is, no root folder', shouldFailBecauseOfNoRootFolderOpened);
    describe('With a loaded workspace, having a loaded root folder', shouldSucceedAndExposeDefaultSettings);
  });
});

function shouldFailBecauseOfNoRootFolderOpened() {
  it('should be instantiated correctly but throw an exception and report in error channel when workspace folders are not set', () => {
    const workspace = vscode.buildFakeWorkspaceWithoutWorkspaceFolderAndWithoutSettings();
    const errorChannelSpy = e.buildSpyOfErrorChannel(e.buildFakeErrorChannel());
    const errorChannel = errorChannelSpy.object;

    const provider = SettingsProvider.make({ workspace, errorChannel });

    const errorMessage = 'A workspace must be loaded to get coverage information.';

    (() => { provider.settings; }).should.throw(errorMessage);

    errorChannelSpy.countFor('appendLine').should.be.equal(1);
  });
}

function shouldSucceedAndExposeDefaultSettings() {
  it('should be instantiated correctly with a vscode workspace-like instance and provide ' +
    'settings with correct default values', () => {
      const workspace = vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
      const errorChannel = e.buildFakeErrorChannel();

      const provider = SettingsProvider.make({ workspace, errorChannel });
      const settings = provider.settings;

      settings.additionalCmakeOptions.should.be.empty;
      settings.buildTreeDirectory.should.be.equal(defaultSetting('buildTreeDirectory'));
      settings.cmakeCommand.should.be.equal(defaultSetting('cmakeCommand'));
      settings.cmakeTarget.should.be.equal(defaultSetting('cmakeTarget'));
      settings.coverageInfoFileName.should.be.equal(defaultSetting('coverageInfoFileName'));

      settings.rootDirectory.should.be.equal(defaultSetting('rootDirectory'));
    });
}

import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import { defaultSetting } from '../../utils/settings';

import * as SettingsProvider from '../../../src/domain/services/internal/settings-provider';

import { vscodeWorkspace as v } from '../../faked-adapters/vscode-workspace';

describe('Unit test suite', () => {
  describe('The setting provider behavior', () => {
    describe('With a workspace that is not loaded, that is, no root folder', shouldFailBecauseOfNoRootFolderOpened);
    describe('With a loaded workspace, having a loaded root folder', shouldSucceedAndExposeDefaultSettings);
  });
});

function shouldFailBecauseOfNoRootFolderOpened() {
  it('should be instantiated correctly but throw an exception when workspace folders are not set', () => {
    const fakedWorkspace = v.buildFakeWorkspaceWithoutWorkspaceFolderAndWithoutSettings();
    const provider = SettingsProvider.make(fakedWorkspace);
    (() => { provider.settings; }).should.throw(
      'A workspace must be loaded to get coverage information.');
  });
}

function shouldSucceedAndExposeDefaultSettings() {
  it('should be instantiated correctly with a vscode workspace-like instance and provide ' +
    'settings with correct default values', () => {
      const fakedWorkspace = v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
      const provider = SettingsProvider.make(fakedWorkspace);
      const settings = provider.settings;

      settings.additionalCmakeOptions.should.be.empty;
      settings.buildTreeDirectory.should.be.equal(defaultSetting('buildTreeDirectory'));
      settings.cmakeCommand.should.be.equal(defaultSetting('cmakeCommand'));
      settings.cmakeTarget.should.be.equal(defaultSetting('cmakeTarget'));
      settings.coverageInfoFileName.should.be.equal(defaultSetting('coverageInfoFileName'));

      const workspaceFolders = fakedWorkspace.workspaceFolders as Array<SettingsProvider.VscodeWorkspaceFolderLike>;
      settings.rootDirectory.should.be.equal(defaultSetting('rootDirectory'));
    });
}

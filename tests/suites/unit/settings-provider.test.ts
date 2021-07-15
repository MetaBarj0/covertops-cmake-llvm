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
      const expectedSettings = {
        additionalCmakeOptions: <Array<string>>[],
        buildTreeDirectory: Imports.TestUtils.defaultSetting('buildTreeDirectory'),
        cmakeCommand: Imports.TestUtils.defaultSetting('cmakeCommand'),
        cmakeTarget: Imports.TestUtils.defaultSetting('cmakeTarget'),
        coverageInfoFileName: Imports.TestUtils.defaultSetting('coverageInfoFileName'),
        rootDirectory: Imports.TestUtils.defaultSetting('rootDirectory')
      } as const;

      const settings = Imports.Domain.Implementations.SettingsProvider.make({ workspace, errorChannel }).settings;

      settings.should.be.deep.equal(expectedSettings);
    });
}

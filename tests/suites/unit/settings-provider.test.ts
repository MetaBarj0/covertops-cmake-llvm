import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import {
  SettingsProvider,
  VscodeWorkspaceFolderLike,
} from '../../../src/domain/services/settings-provider';

import { workspace as w } from '../../builders/fake-adapters';

describe('how the settings provider works with a fake of vscode api for configuration', () => {
  it('should be instantiated correctly with a vscode workspace-like instance and provide ' +
    'settings with correct default values', () => {
      const fakedWorkspace = w.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
      const provider = new SettingsProvider(fakedWorkspace);
      const settings = provider.settings;

      settings.additionalCmakeOptions.should.be.empty;
      settings.buildTreeDirectory.should.be.equal('build');
      settings.cmakeCommand.should.be.equal('cmake');
      settings.cmakeTarget.should.be.equal('coverage');
      settings.coverageInfoFileName.should.be.equal('coverage.json');

      const workspaceFolders = fakedWorkspace.workspaceFolders as Array<VscodeWorkspaceFolderLike>;
      const expectedRootDirectory = workspaceFolders[0].uri.fsPath;
      settings.rootDirectory.should.be.equal(expectedRootDirectory);
    });

  it('should be instantiated correctly but throw an exception when workspace folders are not set', () => {
    const fakedWorkspace = w.buildFakeWorkspaceWithoutWorkspaceFolderAndWithoutSettings();
    const provider = new SettingsProvider(fakedWorkspace);
    (() => { provider.settings; }).should.throw(
      'A workspace must be loaded to get coverage information.');
  });
});

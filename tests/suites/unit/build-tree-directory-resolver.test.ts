import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

import { BuildTreeDirectoryResolver } from '../../../src/domain/services/build-tree-directory-resolver';

import { workspace } from '../../builders/fake-adapters';
import buildFakedVscodeWorkspaceWithWorkspaceFolderAndWithOverridableDefaultSettings =
workspace.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings;

import { statFile, fs } from '../../builders/fake-adapters';
import buildFakeFailingStatFile = statFile.buildFakeFailingStatFile;
import buildFakeSucceedingStatFile = statFile.buildFakeSucceedingStatFile;
import buildFakeFailingFs = fs.buildFakeFailingFs;
import buildFakeSucceedingFs = fs.buildFakeSucceedingFs;
import path = require('path');
import { SettingsProvider } from '../../../src/domain/services/settings-provider';

chai.use(chaiAsPromised);
chai.should();

describe('the build tree directory resolver behavior regardin the build tree directory setting value', () => {
  it('should fail to resolve when the build tree directory setting look like an absolute path', () => {
    // TODO: make a facade to decouple vscode workspace of the domain
    const workspace = buildFakedVscodeWorkspaceWithWorkspaceFolderAndWithOverridableDefaultSettings({
      buildTreeDirectory: path.normalize('/absolute/build')
    });
    const statFile = buildFakeFailingStatFile();
    const fs = buildFakeFailingFs();

    const resolver = new BuildTreeDirectoryResolver({ workspace, statFile, fs });

    return resolver.resolveBuildTreeDirectoryAbsolutePath().should.eventually.be.rejectedWith(
      "Incorrect absolute path specified in 'cmake-llvm-coverage: Build Tree Directory'. It must be a relative path.");
  });

  it('should fail to resolve if specified relative path target does not exist and cannot be created', () => {
    const workspace = buildFakedVscodeWorkspaceWithWorkspaceFolderAndWithOverridableDefaultSettings();
    const statFile = buildFakeFailingStatFile();
    const fs = buildFakeFailingFs();

    const resolver = new BuildTreeDirectoryResolver({ workspace, statFile, fs });

    return resolver.resolveBuildTreeDirectoryAbsolutePath().should.eventually.be.rejectedWith(
      'Cannot find or create the build tree directory. Ensure the ' +
      "'cmake-llvm-coverage: Build Tree Directory' setting is a valid relative path.");
  });

  it('should resolve the full path of the build tree directory if the specified setting target an existing directory', () => {
    const workspace = buildFakedVscodeWorkspaceWithWorkspaceFolderAndWithOverridableDefaultSettings();
    const settings = new SettingsProvider(workspace).settings;
    const statFile = buildFakeSucceedingStatFile();
    const fs = buildFakeFailingFs();

    const resolver = new BuildTreeDirectoryResolver({ workspace, statFile, fs });

    return resolver.resolveBuildTreeDirectoryAbsolutePath().should.eventually.be.equal(
      `${path.join(settings.rootDirectory, settings.buildTreeDirectory)}`);
  });

  it('should resolve the full path of the build tree directory if the specified setting target ' +
    'an unexisting directory that can be created', () => {
      const workspace = buildFakedVscodeWorkspaceWithWorkspaceFolderAndWithOverridableDefaultSettings();
      const settings = new SettingsProvider(workspace).settings;
      const statFile = buildFakeFailingStatFile();
      const fs = buildFakeSucceedingFs();

      const resolver = new BuildTreeDirectoryResolver({ workspace, statFile, fs });

      return resolver.resolveBuildTreeDirectoryAbsolutePath().should.eventually.be.equal(
        `${path.join(settings.rootDirectory, settings.buildTreeDirectory)}`);
    });
});

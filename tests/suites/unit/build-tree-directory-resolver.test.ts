import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

import { BuildTreeDirectoryResolver } from '../../../src/domain/services/build-tree-directory-resolver';

import { workspace } from '../../builders/fake-adapters';
import buildFakedVscodeWorkspaceWithWorkspaceFolderAndWithOverridableDefaultSettings =
workspace.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings;

import { statFile } from '../../builders/fake-adapters';
import buildFailingFakeStatFile = statFile.buildFailingFakeStatFile;
import buildSucceedingFakeStatFile = statFile.buildSucceedingFakeStatFile;

chai.use(chaiAsPromised);
chai.should();

describe('how the file or directory resolver works with a fake file system stat feature.', () => {
  it('should be instantiated correctly and throw an exception when the build ' +
    'tree directory setting is wrong', () => {
      const fakedWorkspace = buildFakedVscodeWorkspaceWithWorkspaceFolderAndWithOverridableDefaultSettings({ buildTreeDirectory: '' });

      const fakedStatFile = buildFailingFakeStatFile();
      const resolver = new BuildTreeDirectoryResolver(fakedWorkspace, fakedStatFile);

      return resolver.resolveBuildTreeDirectoryAbsolutePath().should.eventually.be.rejectedWith(
        "Cannot find the build tree directory. Ensure the 'cmake-llvm-coverage: Build Tree Directory' " +
        'setting is correctly set and target to an existing cmake build tree directory.');
    });

  it('should be instantiated correctly and resolve when the build ' +
    'tree directory setting is correct', () => {
      const fakedWorkspace = buildFakedVscodeWorkspaceWithWorkspaceFolderAndWithOverridableDefaultSettings();

      const fakedStatFile = buildSucceedingFakeStatFile();
      const resolver = new BuildTreeDirectoryResolver(fakedWorkspace, fakedStatFile);

      return resolver.resolveBuildTreeDirectoryAbsolutePath().should.eventually.be.fulfilled;
    });
});
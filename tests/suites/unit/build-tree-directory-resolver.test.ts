import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as definitions from '../../../src/definitions';
import * as BuildTreeDirectoryResolver from '../../../src/domain/services/internal/build-tree-directory-resolver';

import { fs } from '../../faked-adapters/fs';
import { vscodeWorkspace as v } from '../../faked-adapters/vscode-workspace';
import { statFile as sf } from '../../faked-adapters/stat-file';

import path = require('path');

describe('the build tree directory resolver behavior regarding the build tree directory setting value', () => {
  it('should fail to resolve when the build tree directory setting look like an absolute path', () => {
    const workspace = v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({
      buildTreeDirectory: path.normalize('/absolute/build')
    });

    const statFile = sf.buildFakeFailingStatFile();
    const failingFs = fs.buildFakeFailingFs();

    const resolver = BuildTreeDirectoryResolver.make({ workspace, statFile, fs: failingFs });

    return resolver.resolveAbsolutePath().should.eventually.be.rejectedWith(
      `Incorrect absolute path specified in '${definitions.extensionNameInSettings}: Build Tree Directory'. It must be a relative path.`);
  });

  it('should fail to resolve if specified relative path target does not exist and cannot be created', () => {
    const workspace = v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const statFile = sf.buildFakeFailingStatFile();
    const failingFs = fs.buildFakeFailingFs();

    const resolver = BuildTreeDirectoryResolver.make({ workspace, statFile, fs: failingFs });

    return resolver.resolveAbsolutePath().should.eventually.be.rejectedWith(
      'Cannot find or create the build tree directory. Ensure the ' +
      `'${definitions.extensionNameInSettings}: Build Tree Directory' setting is a valid relative path.`);
  });

  it('should resolve the full path of the build tree directory if the specified setting target an existing directory', () => {
    const workspace = v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const statFile = sf.buildFakeSucceedingStatFile();
    const failingFs = fs.buildFakeFailingFs();

    const resolver = BuildTreeDirectoryResolver.make({ workspace, statFile, fs: failingFs });

    return resolver.resolveAbsolutePath().should.eventually.be.fulfilled;
  });

  it('should resolve the full path of the build tree directory if the specified setting target ' +
    'an unexisting directory that can be created', () => {
      const workspace = v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
      const statFile = sf.buildFakeFailingStatFile();
      const succeedingFs = fs.buildFakeSucceedingFs();

      const resolver = BuildTreeDirectoryResolver.make({ workspace, statFile, fs: succeedingFs });

      return resolver.resolveAbsolutePath().should.eventually.be.fulfilled;
    });
});

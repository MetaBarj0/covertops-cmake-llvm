import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as definitions from '../../../src/definitions';
import * as BuildTreeDirectoryResolver from '../../../src/domain/services/internal/build-tree-directory-resolver';

import { mkDir as md } from '../../faked-adapters/mk-dir';
import { vscodeWorkspace as v } from '../../faked-adapters/vscode-workspace';
import { statFile as sf } from '../../faked-adapters/stat-file';
import { progressReporter as pr } from '../../faked-adapters/progress-reporter';

import path = require('path');

describe('Unit test suite', () => {
  describe('the build tree directory resolver behavior', () => {
    describe('its failure to resolve a build tree directory as an absolute path', buildTreeDirectoryResolverShouldFailWhenBuildTreeDirectoryIsAnAbsolutePath);
    describe('its failure to resolve an inexisting build tree directory that cannot be created', buildTreeDirectoryResolverShouldFailWhenBuildTreeDirectoryDoesNotExistAndCannotBeCreated);
    describe('its success to resolve an existing build tree directory', buildTreeDirectoryResolverShouldSucceedWhenBuildTreeDirectoryExists);
    describe('its success to resolve an inexisting build tree directory that can be created', buildTreeDirectoryResolverShouldSucceedWhenBuildTreeDirectoryDoesNotExistAndCanBeCreated);
  });
});

function buildTreeDirectoryResolverShouldFailWhenBuildTreeDirectoryIsAnAbsolutePath() {
  it('should fail to resolve when the build tree directory setting looks like an absolute path', () => {
    const workspace = v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({
      buildTreeDirectory: path.normalize('/absolute/build')
    });

    const statFile = sf.buildFakeFailingStatFile();
    const mkDir = md.buildFakeFailingMkDir();
    const progressReporter = pr.buildFakeProgressReporter();

    const resolver = BuildTreeDirectoryResolver.make({
      workspace,
      statFile,
      mkDir,
      progressReporter
    });

    return resolver.resolveAbsolutePath().should.eventually.be.rejectedWith(
      `Incorrect absolute path specified in '${definitions.extensionNameInSettings}: Build Tree Directory'. It must be a relative path.`);
  });
}

function buildTreeDirectoryResolverShouldFailWhenBuildTreeDirectoryDoesNotExistAndCannotBeCreated() {
  it('should fail to resolve if specified relative path target does not exist and cannot be created', () => {
    const workspace = v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const statFile = sf.buildFakeFailingStatFile();
    const mkDir = md.buildFakeFailingMkDir();
    const progressReporter = pr.buildFakeProgressReporter();

    const resolver = BuildTreeDirectoryResolver.make({
      workspace,
      statFile,
      mkDir,
      progressReporter
    });

    return resolver.resolveAbsolutePath().should.eventually.be.rejectedWith(
      'Cannot find or create the build tree directory. Ensure the ' +
      `'${definitions.extensionNameInSettings}: Build Tree Directory' setting is a valid relative path.`);
  });
}

function buildTreeDirectoryResolverShouldSucceedWhenBuildTreeDirectoryExists() {
  it('should resolve the full path of the build tree directory if the specified setting target an existing directory', async () => {
    const workspace = v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const statFile = sf.buildFakeSucceedingStatFile();
    const mkDir = md.buildFakeFailingMkDir();
    const spy = pr.buildSpyOfProgressReporter(pr.buildFakeProgressReporter());
    const progressReporter = spy.object;

    const resolver = BuildTreeDirectoryResolver.make({
      workspace,
      statFile,
      mkDir,
      progressReporter
    });

    await resolver.resolveAbsolutePath();

    spy.countFor('report').should.be.equal(1);
  });
}

function buildTreeDirectoryResolverShouldSucceedWhenBuildTreeDirectoryDoesNotExistAndCanBeCreated() {
  it('should resolve the full path of the build tree directory if the specified setting target ' +
    'an unexisting directory that can be created', async () => {
      const workspace = v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
      const statFile = sf.buildFakeFailingStatFile();
      const mkDir = md.buildFakeSucceedingMkDir();
      const spy = pr.buildSpyOfProgressReporter(pr.buildFakeProgressReporter());
      const progressReporter = spy.object;

      const resolver = BuildTreeDirectoryResolver.make({
        workspace,
        statFile,
        mkDir,
        progressReporter
      });

      await resolver.resolveAbsolutePath();

      spy.countFor('report').should.be.equal(1);
    });
}
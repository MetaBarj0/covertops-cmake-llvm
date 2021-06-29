import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as definitions from '../../../src/definitions';
import * as BuildTreeDirectoryResolver from '../../../src/domain/services/internal/build-tree-directory-resolver';
import * as SettingsProvider from '../../../src/domain/services/internal/settings-provider';

import { mkDir as md } from '../../fakes/adapters/mk-dir';
import *  as vscode from '../../fakes/adapters/vscode';
import { statFile as sf } from '../../fakes/adapters/stat-file';
import { progressReporter as pr } from '../../fakes/adapters/progress-reporter';
import { errorChannel as e } from '../../fakes/adapters/error-channel';

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
  it('should fail to resolve and report to error channel when the build tree directory setting looks like an absolute path', () => {
    const workspace = vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({
      buildTreeDirectory: path.normalize('/absolute/build')
    });
    const errorChannelSpy = e.buildSpyOfErrorChannel(e.buildFakeErrorChannel());
    const errorChannel = errorChannelSpy.object;
    const settings = SettingsProvider.make({ errorChannel, workspace }).settings;
    const statFile = sf.buildFakeFailingStatFile();
    const mkDir = md.buildFakeFailingMkDir();
    const progressReporter = pr.buildFakeProgressReporter();

    const resolver = BuildTreeDirectoryResolver.make({
      settings,
      stat: statFile,
      mkDir,
      progressReporter,
      errorChannel
    });

    return resolver.resolveAbsolutePath()
      .catch((error: Error) => {
        error.message.should.contain(
          `Incorrect absolute path specified in '${definitions.extensionNameInSettings}: Build Tree Directory'. It must be a relative path.`);

        errorChannelSpy.countFor('appendLine').should.be.equal(1);
      });
  });
}

function buildTreeDirectoryResolverShouldFailWhenBuildTreeDirectoryDoesNotExistAndCannotBeCreated() {
  it('should fail to resolve and report in error channel if specified relative path target does not exist and cannot be created', () => {
    const workspace = vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const errorChannelSpy = e.buildSpyOfErrorChannel(e.buildFakeErrorChannel());
    const errorChannel = errorChannelSpy.object;
    const settings = SettingsProvider.make({ errorChannel, workspace }).settings;
    const statFile = sf.buildFakeFailingStatFile();
    const mkDir = md.buildFakeFailingMkDir();
    const progressReporter = pr.buildFakeProgressReporter();

    const resolver = BuildTreeDirectoryResolver.make({
      settings,
      stat: statFile,
      mkDir,
      progressReporter,
      errorChannel
    });

    return resolver.resolveAbsolutePath()
      .catch((error: Error) => {
        error.message.should.contain(
          'Cannot find or create the build tree directory. Ensure the ' +
          `'${definitions.extensionNameInSettings}: Build Tree Directory' setting is a valid relative path.`);

        errorChannelSpy.countFor('appendLine').should.be.equal(1);
      });
  });
}

function buildTreeDirectoryResolverShouldSucceedWhenBuildTreeDirectoryExists() {
  it('should resolve the full path of the build tree directory if the specified setting target an existing directory', async () => {
    const workspace = vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const errorChannel = e.buildFakeErrorChannel();
    const settings = SettingsProvider.make({ errorChannel, workspace }).settings;
    const statFile = sf.buildFakeSucceedingStatFile();
    const mkDir = md.buildFakeFailingMkDir();
    const progressReporterSpy = pr.buildSpyOfProgressReporter(pr.buildFakeProgressReporter());
    const progressReporter = progressReporterSpy.object;

    const resolver = BuildTreeDirectoryResolver.make({
      settings,
      stat: statFile,
      mkDir,
      progressReporter,
      errorChannel
    });

    await resolver.resolveAbsolutePath();

    progressReporterSpy.countFor('report').should.be.equal(1);
  });
}

function buildTreeDirectoryResolverShouldSucceedWhenBuildTreeDirectoryDoesNotExistAndCanBeCreated() {
  it('should resolve the full path of the build tree directory if the specified setting target ' +
    'an unexisting directory that can be created', async () => {
      const workspace = vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
      const errorChannel = e.buildFakeErrorChannel();
      const settings = SettingsProvider.make({ errorChannel, workspace }).settings;
      const statFile = sf.buildFakeFailingStatFile();
      const mkDir = md.buildFakeSucceedingMkDir();
      const progressReporterSpy = pr.buildSpyOfProgressReporter(pr.buildFakeProgressReporter());
      const progressReporter = progressReporterSpy.object;

      const resolver = BuildTreeDirectoryResolver.make({
        settings,
        stat: statFile,
        mkDir,
        progressReporter,
        errorChannel
      });

      await resolver.resolveAbsolutePath();

      progressReporterSpy.countFor('report').should.be.equal(1);
    });
}
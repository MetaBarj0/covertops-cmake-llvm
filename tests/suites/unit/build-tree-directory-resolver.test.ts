import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as Imports from './imports';
import * as path from 'path';

describe('Unit test suite', () => {
  describe('the build tree directory resolver behavior', () => {
    describe('its failure to resolve a build tree directory as an absolute path', buildTreeDirectoryResolverShouldFailWhenBuildTreeDirectoryIsAnAbsolutePath);
    describe('its failure to resolve an inexisting build tree directory that cannot be created', buildTreeDirectoryResolverShouldFailWhenBuildTreeDirectoryDoesNotExistAndCannotBeCreated);
    describe('its success to resolve an existing build tree directory', buildTreeDirectoryResolverShouldSucceedWhenBuildTreeDirectoryExists);
    describe('its success to resolve an inexisting build tree directory that can be created', buildTreeDirectoryResolverShouldSucceedWhenBuildTreeDirectoryDoesNotExistAndCanBeCreated);
  });
});

function buildTreeDirectoryResolverShouldFailWhenBuildTreeDirectoryIsAnAbsolutePath() {
  it('should fail to resolve and report to output channel when the build tree directory setting looks like an absolute path', () => {
    const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({
      buildTreeDirectory: path.normalize('/absolute/build')
    });
    const outputChannelSpy = Imports.Fakes.Adapters.vscode.buildSpyOfOutputChannel(Imports.Fakes.Adapters.vscode.buildFakeOutputChannel());
    const outputChannel = outputChannelSpy.object;
    const settings = Imports.Domain.Implementations.SettingsProvider.make({ outputChannel, workspace }).settings;
    const statFile = Imports.Fakes.Adapters.FileSystem.buildFakeFailingStatFile();
    const mkDir = Imports.Fakes.Adapters.FileSystem.buildFakeFailingMkDir();
    const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();

    const resolver = Imports.Domain.Implementations.BuildTreeDirectoryResolver.make({
      settings,
      stat: statFile,
      mkdir: mkDir,
      progressReporter,
      outputChannel
    });

    return resolver.resolve()
      .catch((error: Error) => {
        error.message.should.contain(
          `Incorrect absolute path specified in '${Imports.Extension.Definitions.extensionNameInSettings}: Build Tree Directory'. It must be a relative path.`);

        outputChannelSpy.countFor('appendLine').should.be.equal(1);
      });
  });
}

function buildTreeDirectoryResolverShouldFailWhenBuildTreeDirectoryDoesNotExistAndCannotBeCreated() {
  it('should fail to resolve and report in output channel if specified relative path target does not exist and cannot be created', () => {
    const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const outputChannelSpy = Imports.Fakes.Adapters.vscode.buildSpyOfOutputChannel(Imports.Fakes.Adapters.vscode.buildFakeOutputChannel());
    const outputChannel = outputChannelSpy.object;
    const settings = Imports.Domain.Implementations.SettingsProvider.make({ outputChannel, workspace }).settings;
    const statFile = Imports.Fakes.Adapters.FileSystem.buildFakeFailingStatFile();
    const mkDir = Imports.Fakes.Adapters.FileSystem.buildFakeFailingMkDir();
    const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();

    const resolver = Imports.Domain.Implementations.BuildTreeDirectoryResolver.make({
      settings,
      stat: statFile,
      mkdir: mkDir,
      progressReporter,
      outputChannel
    });

    return resolver.resolve()
      .catch((error: Error) => {
        error.message.should.contain(
          'Cannot find or create the build tree directory. Ensure the ' +
          `'${Imports.Extension.Definitions.extensionNameInSettings}: Build Tree Directory' setting is a valid relative path.`);

        outputChannelSpy.countFor('appendLine').should.be.equal(1);
      });
  });
}

function buildTreeDirectoryResolverShouldSucceedWhenBuildTreeDirectoryExists() {
  it('should resolve the full path of the build tree directory if the specified setting target an existing directory', async () => {
    const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const outputChannel = Imports.Fakes.Adapters.vscode.buildFakeOutputChannel();
    const settings = Imports.Domain.Implementations.SettingsProvider.make({ outputChannel, workspace }).settings;
    const statFile = Imports.Fakes.Adapters.FileSystem.buildFakeSucceedingStatFile();
    const mkDir = Imports.Fakes.Adapters.FileSystem.buildFakeFailingMkDir();
    const progressReporterSpy = Imports.Fakes.Adapters.vscode.buildSpyOfProgressReporter(Imports.Fakes.Adapters.vscode.buildFakeProgressReporter());
    const progressReporter = progressReporterSpy.object;

    const resolver = Imports.Domain.Implementations.BuildTreeDirectoryResolver.make({
      settings,
      stat: statFile,
      mkdir: mkDir,
      progressReporter,
      outputChannel
    });

    await resolver.resolve();

    progressReporterSpy.countFor('report').should.be.equal(1);
  });
}

function buildTreeDirectoryResolverShouldSucceedWhenBuildTreeDirectoryDoesNotExistAndCanBeCreated() {
  it('should resolve the full path of the build tree directory if the specified setting target ' +
    'an unexisting directory that can be created', async () => {
      const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
      const outputChannel = Imports.Fakes.Adapters.vscode.buildFakeOutputChannel();
      const settings = Imports.Domain.Implementations.SettingsProvider.make({ outputChannel, workspace }).settings;
      const statFile = Imports.Fakes.Adapters.FileSystem.buildFakeFailingStatFile();
      const mkDir = Imports.Fakes.Adapters.FileSystem.buildFakeSucceedingMkDir();
      const progressReporterSpy = Imports.Fakes.Adapters.vscode.buildSpyOfProgressReporter(Imports.Fakes.Adapters.vscode.buildFakeProgressReporter());
      const progressReporter = progressReporterSpy.object;

      const resolver = Imports.Domain.Implementations.BuildTreeDirectoryResolver.make({
        settings,
        stat: statFile,
        mkdir: mkDir,
        progressReporter,
        outputChannel
      });

      await resolver.resolve();

      progressReporterSpy.countFor('report').should.be.equal(1);
    });
}
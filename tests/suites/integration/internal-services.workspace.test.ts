import * as chai from 'chai';
import { describe, it, before, after } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import { defaultSetting } from '../../utils/settings';

import * as SettingsProvider from '../../../src/domain/services/internal/settings-provider';
import * as BuildTreeDirectoryResolver from '../../../src/domain/services/internal/build-tree-directory-resolver';
import * as BuildSystemGenerator from '../../../src/domain/services/internal/build-system-generator';
import * as definitions from '../../../src/definitions';

import { progressReporter as pr } from '../../faked-adapters/progress-reporter';
import { errorChannel as e } from '../../faked-adapters/error-channel';

import * as vscode from 'vscode';
import { env } from 'process';
import * as path from 'path';
import { fileSystem } from '../../../src/adapters/file-system';
import { childProcess } from '../../../src/adapters/child-process';

describe('integration test suite', () => {
  describe('the behavior of internal services', () => {
    describe('instantiating the setting provider with a real vscode workspace', settingsProviderGivesDefaultSettings);
    describe('with an initialized vscode workspace', () => {
      describe('the behavior of build tree directory resolver', () => {
        describe('with an invalid build tree directory setting', buildTreeDirectoryResolverShouldFail);
        describe('with a valid build tree directory setting', buildTreeDirectoryResolverShouldSucceed);
      });
      describe('the behavior of the build system generator', () => {
        describe('with an invalid cmake command setting', buildSystemGeneratorInvocationShouldFail);
        describe('with an invalid cmake target setting', buildSystemGeneratorTargetBuildingShouldFail);
        describe('with valid cmake comand and cmake target settings', buildSystemGeneratorTargetBuildingShouldSucceed);
      });
    });
  });
});

function settingsProviderGivesDefaultSettings() {
  it('should not throw any exception when instantiating settings provider and settings should be set with default values', () => {
    const settings = SettingsProvider.make(vscode.workspace).settings;

    settings.buildTreeDirectory.should.be.equal('build');
    settings.cmakeCommand.should.be.equal('cmake');
    settings.cmakeTarget.should.be.equal('coverage');
    settings.coverageInfoFileName.should.be.equal('coverage.json');
    settings.additionalCmakeOptions.should.be.empty;

    const rootFolder = (vscode.workspace.workspaceFolders as Array<vscode.WorkspaceFolder>)[0].uri.fsPath;
    settings.rootDirectory.should.be.equal(rootFolder);
  });
}

function buildTreeDirectoryResolverShouldFail() {
  before('setting up a bad build tree directory setting', async () =>
    await extensionConfiguration.update('buildTreeDirectory', '*<>buildz<>*\0'));

  it('should not be possible to find or create the build tree directory', () => {
    return makeBuildTreeDirectoryResolver().resolveAbsolutePath().should.eventually.be.rejectedWith(
      'Cannot find or create the build tree directory. Ensure the ' +
      `'${definitions.extensionNameInSettings}: Build Tree Directory' setting is a valid relative path.`);
  });

  after('restoring default build tree directory setting', async () =>
    await extensionConfiguration.update('buildTreeDirectory', defaultSetting('buildTreeDirectory')));
}

function buildSystemGeneratorInvocationShouldFail() {
  before('Modifying cmake command setting', async () => {
    await extensionConfiguration.update('cmakeCommand', 'cmakez');
  });

  it('should fail in attempting to invoke the build system generator', () => {
    return makeCmake().buildTarget().should.eventually.be.rejectedWith(
      `Cannot find the cmake command. Ensure the '${definitions.extensionNameInSettings}: Cmake Command' ` +
      'setting is correctly set. Have you verified your PATH environment variable?');
  });

  after('restoring cmake command setting', async () => {
    await extensionConfiguration.update('cmakeCommand', defaultSetting('cmakeCommand'));
  });
}

function buildSystemGeneratorTargetBuildingShouldFail() {
  let originalEnvPath: string;

  before('Modifying cmake target and additional options settings and PATH environment variable', async () => {
    await Promise.all([
      extensionConfiguration.update('cmakeTarget', 'Oh my god! This is clearly an invalid cmake target'),
      extensionConfiguration.update('additionalCmakeOptions', ['-DCMAKE_CXX_COMPILER=clang++', '-G', 'Ninja'])
    ]);

    originalEnvPath = prependLlvmBinDirToPathEnvironmentVariable();
  });

  it('should fail in attempting to build an invalid cmake target', () => {
    const settings = SettingsProvider.make(vscode.workspace).settings;

    return makeCmake().buildTarget().should.eventually.be.rejectedWith(
      `Error: Could not build the specified cmake target ${settings.cmakeTarget}. ` +
      `Ensure '${definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`);
  });

  after('restoring cmake target and additonal options settings and PATH environment variable', async () => {
    await Promise.all([
      extensionConfiguration.update('cmakeTarget', defaultSetting('cmakeTarget')),
      extensionConfiguration.update('additionalCmakeOptions', defaultSetting('additionalCmakeOptions'))
    ]);

    env['PATH'] = originalEnvPath;
  });
}

function buildTreeDirectoryResolverShouldSucceed() {
  it('should find the build tree directory', () => {
    return makeBuildTreeDirectoryResolver().resolveAbsolutePath().should.eventually.be.fulfilled;
  });
}

function buildSystemGeneratorTargetBuildingShouldSucceed() {
  let originalEnvPath: string;

  before('Modifying additional cmake command options, PATH environment variable ', async () => {
    await extensionConfiguration.update('additionalCmakeOptions', ['-DCMAKE_CXX_COMPILER=clang++', '-G', 'Ninja']);

    originalEnvPath = prependLlvmBinDirToPathEnvironmentVariable();
  });

  it('should not throw when attempting to build a valid cmake target specified in settings', () => {
    return makeCmake().buildTarget().should.eventually.be.fulfilled;
  });

  after('restoring additional cmake command options and PATH environment variable', async () => {
    await extensionConfiguration.update('additionalCmakeOptions', []);

    env['PATH'] = originalEnvPath;
  });
}

function prependLlvmBinDirToPathEnvironmentVariable() {
  const oldPath = <string>env['PATH'];

  if (env['LLVM_DIR']) {
    const binDir = path.join(env['LLVM_DIR'], 'bin');
    const currentPath = <string>env['PATH'];
    env['PATH'] = `${binDir}${path.delimiter}${currentPath}`;
  }

  return oldPath;
}

const extensionConfiguration = vscode.workspace.getConfiguration(definitions.extensionId);

// TODO: function instead of constants
function makeCmake() {
  return BuildSystemGenerator.make({
    workspace: vscode.workspace,
    processForCommand: childProcess.executeFile,
    processForTarget: childProcess.executeFile,
    progressReporter: pr.buildFakeProgressReporter(),
    errorChannel: e.buildFakeErrorChannel()
  });
}

function makeBuildTreeDirectoryResolver() {
  return BuildTreeDirectoryResolver.make({
    workspace: vscode.workspace,
    statFile: fileSystem.statFile,
    mkDir: fileSystem.makeDirectory,
    progressReporter: pr.buildFakeProgressReporter()
  });
}
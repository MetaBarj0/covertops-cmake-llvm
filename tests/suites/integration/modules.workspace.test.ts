import * as chai from 'chai';
import { describe, it, before, after, beforeEach, afterEach } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as Imports from './imports';

import { env } from 'process';
import * as path from 'path';

describe('integration test suite', () => {
  describe('the behavior of all modules but decoration locations provider', () => {
    describe('instantiating the setting provider with a real vscode workspace', settingsProviderGivesDefaultSettings);
    describe('with an initialized vscode workspace', () => {
      describe('the behavior of build tree directory resolver', () => {
        describe('with an invalid build tree directory setting', buildTreeDirectoryResolverShouldFail);
        describe('with a valid build tree directory setting', buildTreeDirectoryResolverShouldSucceed);
      });
      describe('the behavior of cmake', () => {
        const originalPath = <string>env['PATH'];

        beforeEach('Adding LLVM binary directory to PATH', () => { prependLlvmBinDirToPathEnvironmentVariable(); });

        describe('with an unreachable cmake command', cmakeInvocationShouldFail);
        describe('with a fail in cmake project generation', cmakeProjectGenerationShouldFail);
        describe('with a fail in cmake target building', cmakeTargetBuildingShouldFail);
        describe('with valid cmake comand and cmake target settings', cmakeTargetBuildingShouldSucceed);

        afterEach('Restoring original PATH', () => { env['PATH'] = originalPath; });
      });
    });
  });
});

function settingsProviderGivesDefaultSettings() {
  it('should not throw any exception when instantiating settings provider and settings should be set with default values', () => {
    const settings = Imports.Domain.Implementations.SettingsProvider.make({
      workspace: Imports.Adapters.vscode.workspace,
      errorChannel: Imports.Fakes.Adapters.vscode.buildFakeErrorChannel()
    }).settings;

    const expectedSettings = {
      additionalCmakeOptions: <Array<string>>[],
      buildTreeDirectory: Imports.TestUtils.defaultSetting('buildTreeDirectory'),
      cmakeCommand: Imports.TestUtils.defaultSetting('cmakeCommand'),
      cmakeTarget: Imports.TestUtils.defaultSetting('cmakeTarget'),
      coverageInfoFileName: Imports.TestUtils.defaultSetting('coverageInfoFileName'),
      rootDirectory: (Imports.Adapters.vscode.workspace.workspaceFolders as Array<Imports.SharedKernel.vscode.VscodeWorkspaceFolderLike>)[0].uri.fsPath
    } as const;

    settings.should.be.deep.equal(expectedSettings);
  });
}

function buildTreeDirectoryResolverShouldFail() {
  before('setting up a bad build tree directory setting', async () =>
    await extensionConfiguration.update('buildTreeDirectory', '*<>buildz<>*\0'));

  it('should not be possible to find or create the build tree directory', () => {
    return makeBuildTreeDirectoryResolver().resolve().should.eventually.be.rejectedWith(
      'Cannot find or create the build tree directory. Ensure the ' +
      `'${Imports.Extension.Definitions.extensionNameInSettings}: Build Tree Directory' setting is a valid relative path.`);
  });

  after('restoring default build tree directory setting', async () =>
    await extensionConfiguration.update('buildTreeDirectory', Imports.TestUtils.defaultSetting('buildTreeDirectory')));
}

function cmakeInvocationShouldFail() {
  before('Modifying cmake command setting', async () => {
    await extensionConfiguration.update('cmakeCommand', 'cmakez');
  });

  it('should fail in attempting to invoke cmake', () => {
    return makeCmake().buildTarget().should.eventually.be.rejectedWith(
      `Cannot find the cmake command. Ensure the '${Imports.Extension.Definitions.extensionNameInSettings}: Cmake Command' ` +
      'setting is correctly set. Have you verified your PATH environment variable?');
  });

  after('restoring cmake command setting', async () => {
    await extensionConfiguration.update('cmakeCommand', Imports.TestUtils.defaultSetting('cmakeCommand'));
  });
}

function cmakeProjectGenerationShouldFail() {
  before('Modifying additional cmake command options, PATH environment variable ', async () => {
    await extensionConfiguration.update('additionalCmakeOptions', ['-DCMAKE_CXX_COMPILER=clang++', '-G', 'Ninjaz']);
  });

  it('should fail when attempting to generate the project', () => {
    return makeCmake().buildTarget().should.eventually.be.rejectedWith('Cannot generate the cmake project in the ' +
      `${buildSettings().rootDirectory} directory. ` +
      'Ensure either you have opened a valid cmake project, or the cmake project has not already been generated using different options. ' +
      `You may have to take a look in '${Imports.Extension.Definitions.extensionNameInSettings}: Additional Cmake Options' settings ` +
      'and check the generator used is correct for instance.');
  });

  after('restoring additional cmake command options and PATH environment variable', async () => {
    await extensionConfiguration.update('additionalCmakeOptions', []);
  });
}

function cmakeTargetBuildingShouldFail() {
  before('Modifying cmake target and additional options settings and PATH environment variable', async () => {
    await Promise.all([
      extensionConfiguration.update('cmakeTarget', 'Oh my god! This is clearly an invalid cmake target'),
      extensionConfiguration.update('additionalCmakeOptions', ['-DCMAKE_CXX_COMPILER=clang++', '-G', 'Ninja'])
    ]);
  });

  it('should fail in attempting to build an invalid cmake target', () => {
    const settings = Imports.Domain.Implementations.SettingsProvider.make({
      workspace: Imports.Adapters.vscode.workspace,
      errorChannel: Imports.Fakes.Adapters.vscode.buildFakeErrorChannel()
    }).settings;

    return makeCmake().buildTarget().should.eventually.be.rejectedWith(
      `Error: Could not build the specified cmake target ${settings.cmakeTarget}. ` +
      `Ensure '${Imports.Extension.Definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`);
  });

  after('restoring cmake target and additonal options settings and PATH environment variable', async () => {
    await Promise.all([
      extensionConfiguration.update('cmakeTarget', Imports.TestUtils.defaultSetting('cmakeTarget')),
      extensionConfiguration.update('additionalCmakeOptions', Imports.TestUtils.defaultSetting('additionalCmakeOptions'))
    ]);
  });
}

function buildTreeDirectoryResolverShouldSucceed() {
  it('should find the build tree directory', () => {
    return makeBuildTreeDirectoryResolver().resolve().should.eventually.be.fulfilled;
  });
}

function cmakeTargetBuildingShouldSucceed() {
  before('Modifying additional cmake command options, PATH environment variable ', async () => {
    await extensionConfiguration.update('additionalCmakeOptions', ['-DCMAKE_CXX_COMPILER=clang++', '-G', 'Ninja']);
  });

  it('should not throw when attempting to build a valid cmake target specified in settings', () => {
    return makeCmake().buildTarget().should.eventually.be.fulfilled;
  });

  after('restoring additional cmake command options and PATH environment variable', async () => {
    await extensionConfiguration.update('additionalCmakeOptions', []);
  });
}

function prependLlvmBinDirToPathEnvironmentVariable() {
  if (env['LLVM_DIR']) {
    const binDir = path.join(env['LLVM_DIR'], 'bin');
    const currentPath = <string>env['PATH'];
    env['PATH'] = `${binDir}${path.delimiter}${currentPath}`;
  }
}

const extensionConfiguration = Imports.Adapters.vscode.workspace.getConfiguration(Imports.Extension.Definitions.extensionId);

function makeCmake() {
  return Imports.Domain.Implementations.Cmake.make({
    settings: buildSettings(),
    execFile: Imports.Adapters.ProcessControl.execFile,
    progressReporter: Imports.Fakes.Adapters.vscode.buildFakeProgressReporter(),
    errorChannel: Imports.Fakes.Adapters.vscode.buildFakeErrorChannel()
  });
}

function makeBuildTreeDirectoryResolver() {
  const errorChannel = Imports.Fakes.Adapters.vscode.buildFakeErrorChannel();
  const workspace = Imports.Adapters.vscode.workspace;
  const settings = Imports.Domain.Implementations.SettingsProvider.make({ workspace, errorChannel }).settings;

  return Imports.Domain.Implementations.BuildTreeDirectoryResolver.make({
    settings,
    stat: Imports.Adapters.FileSystem.stat,
    mkdir: Imports.Adapters.FileSystem.mkdir,
    progressReporter: Imports.Fakes.Adapters.vscode.buildFakeProgressReporter(),
    errorChannel
  });
}

function buildSettings(): Imports.Domain.Abstractions.Settings {
  return Imports.Domain.Implementations.SettingsProvider.make({
    errorChannel: Imports.Fakes.Adapters.vscode.buildFakeErrorChannel(),
    workspace: Imports.Adapters.vscode.workspace
  }).settings;
}
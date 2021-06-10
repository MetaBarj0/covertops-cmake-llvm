import * as chai from 'chai';
import { describe, it, before, after } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as SettingsProvider from '../../../src/domain/services/internal/settings-provider';
import * as BuildTreeDirectoryResolver from '../../../src/domain/services/internal/build-tree-directory-resolver';
import * as BuildSystemGenerator from '../../../src/domain/services/internal/build-system-generator';
import * as definitions from '../../../src/definitions';
import { RegionCoverageInfo } from '../../../src/domain/value-objects/region-coverage-info';
import { DecorationLocationsProvider } from '../../../src/domain/services/decoration-locations-provider';
// TODO: do not forget to move defautl setting feature in test utils
import { defaultSetting } from '../../../src/domain/value-objects/settings';

import * as vscode from 'vscode';
import { env } from 'process';
import * as path from 'path';
import * as cp from 'child_process';
import { promises as fs, createReadStream } from 'fs';
import * as globby from 'globby';

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

// TODO(WIP): reorganize tests
describe('Nominal cases with real world adapters.', () => {
  let originalEnvPath: string;
  const extensionConfiguration = vscode.workspace.getConfiguration(definitions.extensionId);

  before('Modifying additional cmake command options, PATH environment variable ', async () => {
    await extensionConfiguration.update('additionalCmakeOptions', ['-DCMAKE_CXX_COMPILER=clang++', '-G', 'Ninja']);

    originalEnvPath = prependLlvmBinDirToPathEnvironmentVariable();
  });

  it('should report correct coverage information for a specific file that is fully covered', async () => {
    // TODO: factories for test entrypoints (and later applicative entry points)
    const provider = new DecorationLocationsProvider({
      workspace: vscode.workspace,
      statFile: { stat: fs.stat },
      processForCmakeCommand: { execFile: cp.execFile },
      processForCmakeTarget: { execFile: cp.execFile },
      globSearch: { search: globby },
      fs: { mkdir: fs.mkdir },
      llvmCoverageInfoStreamBuilder: { createStream: createReadStream }
    });

    const sourceFilePath = createAbsoluteSourceFilePathFrom('fullyCovered/fullyCoveredLib.cpp');

    const decorations = await provider.getDecorationLocationsForUncoveredCodeRegions(sourceFilePath);

    // TODO refacto this in proper function exposing object with now awaitable stuff
    const summary = await decorations.summary;

    const uncoveredRegions: Array<RegionCoverageInfo> = [];
    for await (const region of decorations.uncoveredRegions())
      uncoveredRegions.push(region);

    summary.should.be.deep.equal({
      count: 2,
      covered: 2,
      notCovered: 0,
      percent: 100
    });

    uncoveredRegions.length.should.be.equal(0);
  });

  it('should report correct coverage information for a specific cpp file that is partially covered', async () => {
    // TODO: factories for test entrypoints (and later applicative entry points)
    // TODO: adapter in their own files even if small
    const provider = new DecorationLocationsProvider({
      workspace: vscode.workspace,
      statFile: { stat: fs.stat },
      processForCmakeCommand: { execFile: cp.execFile },
      processForCmakeTarget: { execFile: cp.execFile },
      globSearch: { search: globby },
      fs: { mkdir: fs.mkdir },
      llvmCoverageInfoStreamBuilder: { createStream: createReadStream }
    });

    const sourceFilePath = createAbsoluteSourceFilePathFrom('partiallyCovered/partiallyCoveredLib.cpp');

    const decorations = await provider.getDecorationLocationsForUncoveredCodeRegions(sourceFilePath);

    // TODO refacto this in proper function exposing object with now awaitable stuff
    const summary = await decorations.summary;

    const uncoveredRegions: Array<RegionCoverageInfo> = [];
    for await (const region of decorations.uncoveredRegions())
      uncoveredRegions.push(region);

    summary.should.be.deep.equal({
      count: 2,
      covered: 1,
      notCovered: 1,
      percent: 50
    });

    uncoveredRegions.length.should.be.equal(1);
    uncoveredRegions[0].range.should.be.deep.equal({
      start: {
        line: 6,
        character: 53
      },
      end: {
        line: 6,
        character: 71
      }
    });
  });

  after('restoring additional cmake command options and PATH environment variable', async () => {
    await extensionConfiguration.update('additionalCmakeOptions', []);

    env['PATH'] = originalEnvPath;
  });
});

function prependLlvmBinDirToPathEnvironmentVariable(): string {
  const oldPath = <string>env['PATH'];

  if (env['LLVM_DIR']) {
    const binDir = path.join(env['LLVM_DIR'], 'bin');
    const currentPath = <string>env['PATH'];
    env['PATH'] = `${binDir}${path.delimiter}${currentPath}`;
  }

  return oldPath;
}

function createAbsoluteSourceFilePathFrom(workspacePath: string) {
  const relative = path.join('..', '..', '..', 'workspace', 'src', workspacePath);
  const absolute = path.resolve(__dirname, relative);
  const sourceFilePath = path.normalize(absolute);

  return `${sourceFilePath[0].toUpperCase()}${sourceFilePath.slice(1)}`;
}

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
  const extensionConfiguration = vscode.workspace.getConfiguration(definitions.extensionId);

  before('setting up a bad build tree directory setting', async () =>
    await extensionConfiguration.update('buildTreeDirectory', '*<>buildz<>*\0'));

  it('should not be possible to find or create the build tree directory', () => {
    const resolver = BuildTreeDirectoryResolver.make({
      workspace: vscode.workspace,
      statFile: { stat: fs.stat },
      fs: { mkdir: fs.mkdir }
    });

    return resolver.resolveAbsolutePath().should.eventually.be.rejectedWith(
      'Cannot find or create the build tree directory. Ensure the ' +
      `'${definitions.extensionNameInSettings}: Build Tree Directory' setting is a valid relative path.`);
  });

  after('restoring default build tree directory setting', async () =>
    await extensionConfiguration.update('buildTreeDirectory', defaultSetting('buildTreeDirectory')));
}

function buildSystemGeneratorInvocationShouldFail() {
  const extensionConfiguration = vscode.workspace.getConfiguration(definitions.extensionId);

  before('Modifying cmake command setting', async () => {
    await extensionConfiguration.update('cmakeCommand', 'cmakez');
  });

  it('should fail in attempting to invoke the build system generator', () => {
    const cmake = BuildSystemGenerator.make({
      workspace: vscode.workspace,
      processForCommand: { execFile: cp.execFile },
      processForTarget: { execFile: cp.execFile }
    });

    return cmake.buildTarget().should.eventually.be.rejectedWith(
      `Cannot find the cmake command. Ensure the '${definitions.extensionNameInSettings}: Cmake Command' ` +
      'setting is correctly set. Have you verified your PATH environment variable?');
  });

  after('restoring cmake command setting', async () => {
    await extensionConfiguration.update('cmakeCommand', defaultSetting('cmakeCommand'));
  });
}

function buildSystemGeneratorTargetBuildingShouldFail() {
  const extensionConfiguration = vscode.workspace.getConfiguration(definitions.extensionId);
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

    const cmake = BuildSystemGenerator.make({
      workspace: vscode.workspace,
      processForCommand: { execFile: cp.execFile },
      processForTarget: { execFile: cp.execFile }
    });

    return cmake.buildTarget().should.eventually.be.rejectedWith(
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
    const resolver = BuildTreeDirectoryResolver.make({
      workspace: vscode.workspace,
      statFile: { stat: fs.stat },
      fs: { mkdir: fs.mkdir }
    });

    return resolver.resolveAbsolutePath().should.eventually.be.fulfilled;
  });
}

function buildSystemGeneratorTargetBuildingShouldSucceed() {
  const extensionConfiguration = vscode.workspace.getConfiguration(definitions.extensionId);

  let originalEnvPath: string;

  before('Modifying additional cmake command options, PATH environment variable ', async () => {
    await extensionConfiguration.update('additionalCmakeOptions', ['-DCMAKE_CXX_COMPILER=clang++', '-G', 'Ninja']);

    originalEnvPath = prependLlvmBinDirToPathEnvironmentVariable();
  });

  it('should not throw when attempting to build a valid cmake target specified in settings', () => {
    const cmake = BuildSystemGenerator.make({
      workspace: vscode.workspace,
      processForCommand: { execFile: cp.execFile },
      processForTarget: { execFile: cp.execFile }
    });

    return cmake.buildTarget().should.eventually.be.fulfilled;
  });

  after('restoring additional cmake command options and PATH environment variable', async () => {
    await extensionConfiguration.update('additionalCmakeOptions', []);

    env['PATH'] = originalEnvPath;
  });
}
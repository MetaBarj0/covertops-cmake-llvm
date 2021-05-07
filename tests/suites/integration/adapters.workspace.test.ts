import * as chai from 'chai';
import { describe, it, before, after } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import { SettingsProvider } from '../../../src/domain/services/settings-provider';
import { BuildTreeDirectoryResolver } from '../../../src/domain/services/build-tree-directory-resolver';
import { Cmake } from '../../../src/domain/services/cmake';
import { extensionName } from '../../../src/extension-name';

import * as vscode from 'vscode';
import { env } from 'process';
import * as path from 'path';
import * as cp from 'child_process';
import { promises as fs } from 'fs';

describe('The internal services can be instantiated when vscode has an active workspace', () => {
  it('should not throw any exception when instantiating extension settings and settings should be set with default values', () => {
    const settings = new SettingsProvider(vscode.workspace).settings;

    settings.buildTreeDirectory.should.be.equal('build');
    settings.cmakeCommand.should.be.equal('cmake');
    settings.cmakeTarget.should.be.equal('generateCoverageInfoJsonFile');
    settings.coverageInfoFileName.should.be.equal('default.covdata.json');
    settings.additionalCmakeOptions.should.be.empty;

    const rootFolder = (vscode.workspace.workspaceFolders as Array<vscode.WorkspaceFolder>)[0].uri.fsPath;
    settings.rootDirectory.should.be.equal(rootFolder);
  });

  describe('with invalid relative path build tree directory setting', () => {
    before('Modifying build tree directory setting', async () => {
      await vscode.workspace.getConfiguration(extensionName).update('buildTreeDirectory', '*<>buildz<>*\0');
    });

    it('should not be possible to access the full path of the build tree directory using a ' +
      'build tree directory resolver instance set up with an invalid relative path build tree directory in settings.',
      () => {
        const resolver = new BuildTreeDirectoryResolver({
          workspace: vscode.workspace,
          statFile: { stat: fs.stat },
          fs: { mkdir: fs.mkdir }
        });

        return resolver.resolveBuildTreeDirectoryAbsolutePath().should.eventually.be.rejectedWith(
          'Cannot find or create the build tree directory. Ensure the ' +
          `'${extensionName}: Build Tree Directory' setting is a valid relative path.`);
      });

    after('restoring build tree directory setting', async () => {
      await vscode.workspace.getConfiguration(extensionName).update('buildTreeDirectory', 'build');
    });
  });

  describe('with invalid cmake command setting', () => {
    before('Modifying cmake command setting', async () => {
      await vscode.workspace.getConfiguration(extensionName).update('cmakeCommand', 'cmakez');
    });

    it('should throw when attempting to build an assumed valid specified cmake target in settings ' +
      'with an unreachable cmake command', () => {
        const cmake = new Cmake({
          workspace: vscode.workspace,
          processForCommand: { execFile: cp.execFile },
          processForTarget: { execFile: cp.execFile }
        });

        return cmake.buildTarget().should.eventually.be.rejectedWith(
          `Cannot find the cmake command. Ensure the '${extensionName}: Cmake Command' ` +
          'setting is correctly set. Have you verified your PATH environment variable?');
      });

    after('restoring cmake command setting', async () => {
      await vscode.workspace.getConfiguration(extensionName).update('cmakeCommand', 'cmake');
    });
  });

  describe('with invalid cmake target setting and additional cmake options', () => {
    let originalEnvPath: string;

    before('Modifying cmake target and additional options settings and PATH environment variable', async () => {
      await vscode.workspace.getConfiguration(extensionName)
        .update('cmakeTarget', 'Oh my god! This is clearly an invalid cmake target');
      await vscode.workspace.getConfiguration(extensionName).update(
        'additionalCmakeOptions', ['-DCMAKE_CXX_COMPILER=clang++', '-G', 'Ninja']);

      originalEnvPath = prependLlvmBinDirToPathEnvironmentVariable();
    });

    it('should throw when attempting to build an invalid specified cmake target in settings ' +
      'with a reachable cmake command', () => {
        const settings = new SettingsProvider(vscode.workspace).settings;

        const cmake = new Cmake({
          workspace: vscode.workspace,
          processForCommand: { execFile: cp.execFile },
          processForTarget: { execFile: cp.execFile }
        });

        return cmake.buildTarget().should.eventually.be.rejectedWith(
          `Error: Could not build the specified cmake target ${settings.cmakeTarget}. ` +
          `Ensure '${extensionName}: Cmake Target' setting is properly set.`);
      });

    after('restoring cmake target and additonal options settings and PATH environment variable', async () => {
      await vscode.workspace.getConfiguration(extensionName).update('cmakeTarget', 'generateCoverageInfoJsonFile');
      await vscode.workspace.getConfiguration(extensionName).update('additionalCmakeOptions', []);

      env['PATH'] = originalEnvPath;
    });
  });

  describe('with correct settings and additional cmake options', () => {
    let originalEnvPath: string;

    before('Modifying additional cmake command options, PATH environment variable ', async () => {
      await vscode.workspace.getConfiguration(extensionName).update(
        'additionalCmakeOptions', ['-DCMAKE_CXX_COMPILER=clang++', '-G', 'Ninja']);

      originalEnvPath = prependLlvmBinDirToPathEnvironmentVariable();
    });

    it('should be possible to access the full path of the build tree directory using a ' +
      'build tree directory resolver instance.',
      () => {
        const resolver = new BuildTreeDirectoryResolver({
          workspace: vscode.workspace,
          statFile: { stat: fs.stat },
          fs: { mkdir: fs.mkdir }
        });

        return resolver.resolveBuildTreeDirectoryAbsolutePath().should.eventually.be.fulfilled;
      });

    it('should not throw when attempting to build a valid cmake target specified in settings', () => {
      const cmake = new Cmake({
        workspace: vscode.workspace,
        processForCommand: { execFile: cp.execFile },
        processForTarget: { execFile: cp.execFile }
      });

      return cmake.buildTarget().should.eventually.be.fulfilled;
    });

    after('restoring additional cmake command options and PATH environment variable', async () => {
      await vscode.workspace.getConfiguration(extensionName).update('additionalCmakeOptions', []);

      env['PATH'] = originalEnvPath;
    });
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

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

import * as vscode from 'vscode';
import { env } from 'process';
import * as path from 'path';
import * as cp from 'child_process';
import { promises as fs, createReadStream } from 'fs';
import * as globby from 'globby';

describe('The internal services can be instantiated when vscode has an active workspace', () => {
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

  const extensionConfiguration = vscode.workspace.getConfiguration(definitions.extensionId);

  describe('with invalid relative path build tree directory setting', () => {
    before('Modifying build tree directory setting', async () => {
      await extensionConfiguration.update('buildTreeDirectory', '*<>buildz<>*\0');
    });

    it('should not be possible to access the full path of the build tree directory using a ' +
      'build tree directory resolver instance set up with an invalid relative path build tree directory in settings.',
      () => {
        const resolver = BuildTreeDirectoryResolver.make({
          workspace: vscode.workspace,
          statFile: { stat: fs.stat },
          fs: { mkdir: fs.mkdir }
        });

        return resolver.resolveAbsolutePath().should.eventually.be.rejectedWith(
          'Cannot find or create the build tree directory. Ensure the ' +
          `'${definitions.extensionNameInSettings}: Build Tree Directory' setting is a valid relative path.`);
      });

    after('restoring build tree directory setting', async () => {
      await extensionConfiguration.update('buildTreeDirectory', 'build');
    });
  });

  describe('with invalid cmake command setting', () => {
    before('Modifying cmake command setting', async () => {
      await extensionConfiguration.update('cmakeCommand', 'cmakez');
    });

    it('should throw when attempting to build an assumed valid specified cmake target in settings ' +
      'with an unreachable cmake command', () => {
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
      await extensionConfiguration.update('cmakeCommand', 'cmake');
    });
  });

  describe('with invalid cmake target setting and additional cmake options', () => {
    let originalEnvPath: string;

    before('Modifying cmake target and additional options settings and PATH environment variable', async () => {
      await Promise.all([
        extensionConfiguration.update('cmakeTarget', 'Oh my god! This is clearly an invalid cmake target'),
        extensionConfiguration.update('additionalCmakeOptions', ['-DCMAKE_CXX_COMPILER=clang++', '-G', 'Ninja'])
      ]);

      originalEnvPath = prependLlvmBinDirToPathEnvironmentVariable();
    });

    it('should throw when attempting to build an invalid specified cmake target in settings ' +
      'with a reachable cmake command', () => {
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
        extensionConfiguration.update('cmakeTarget', 'coverage'),
        extensionConfiguration.update('additionalCmakeOptions', [])
      ]);

      env['PATH'] = originalEnvPath;
    });
  });

  describe('with correct settings and additional cmake options', () => {
    let originalEnvPath: string;

    before('Modifying additional cmake command options, PATH environment variable ', async () => {
      await extensionConfiguration.update('additionalCmakeOptions', ['-DCMAKE_CXX_COMPILER=clang++', '-G', 'Ninja']);

      originalEnvPath = prependLlvmBinDirToPathEnvironmentVariable();
    });

    it('should be possible to access the full path of the build tree directory using a ' +
      'build tree directory resolver instance.',
      () => {
        const resolver = BuildTreeDirectoryResolver.make({
          workspace: vscode.workspace,
          statFile: { stat: fs.stat },
          fs: { mkdir: fs.mkdir }
        });

        return resolver.resolveAbsolutePath().should.eventually.be.fulfilled;
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
  });
});

describe('The nominal case with real world adapters.', () => {
  it('should report correct coverage information for a specific file', async () => {
    const provider = new DecorationLocationsProvider({
      workspace: vscode.workspace,
      statFile: { stat: fs.stat },
      processForCmakeCommand: { execFile: cp.execFile },
      processForCmakeTarget: { execFile: cp.execFile },
      globSearch: { search: globby },
      fs: { mkdir: fs.mkdir },
      llvmCoverageInfoStreamFactoryBuilder: (path: string) => () => createReadStream(path)
    });

    // TODO: refacto when cicd ok because contains platform specific stuff (drive letter uppercasing)
    const relative = path.join('../../../workspace/src/fullyCovered/fullyCoveredLib.cpp');
    const absolute = path.resolve(__dirname, relative);
    const sourceFilePath = path.normalize(absolute);
    const fixedSourceFilePath = `${sourceFilePath[0].toUpperCase()}${sourceFilePath.slice(1)}`;

    const decorations = await provider.getDecorationLocationsForUncoveredCodeRegions(fixedSourceFilePath);

    const uncoveredRegions: Array<RegionCoverageInfo> = [];
    for await (const region of decorations.uncoveredRegions())
      uncoveredRegions.push(region);

    const summary = await decorations.summary;

    summary.should.be.deep.equal({
      count: 2,
      covered: 2,
      notCovered: 0,
      percent: 100
    });

    uncoveredRegions.length.should.be.equal(0);
    //uncoveredRegions[0].range.should.be.deep.equal({
    //  start: {
    //    line: 6,
    //    character: 53
    //  },
    //  end: {
    //    line: 6,
    //    character: 71
    //  }
    //});
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

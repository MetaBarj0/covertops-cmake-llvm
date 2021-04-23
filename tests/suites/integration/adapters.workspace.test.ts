import * as chai from 'chai';
import * as mocha from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';
import { env } from 'process';
import * as path from 'path';

chai.use(chaiAsPromised);
chai.should();

const describe = mocha.describe;
const it = mocha.it;

import { ExtensionSettings } from '../../../src/adapters/extensionSettings';
import { FileSystemBuildTreeDirectoryResolver } from '../../../src/adapters/fileSystemBuildTreeDirectoryResolver';
import { RealCmakeProcess } from '../../../src/adapters/realCmakeProcess';

import * as vscode from 'vscode';

describe('The way adapters can be instantiated when vscode has an active workspace', () => {
  it('should not throw any exception when instantiating extension settings and settings should be set with default values', () => {
    const settings = new ExtensionSettings();

    settings.buildTreeDirectory.should.be.equal('build');
    settings.cmakeCommand.should.be.equal('cmake');
    settings.cmakeTarget.should.be.equal('reportCoverageDetails');
    settings.coverageInfoFileName.should.be.equal('default.covdata.json');
    settings.additionalCmakeOptions.should.be.empty;

    const rootFolder = (vscode.workspace.workspaceFolders as Array<vscode.WorkspaceFolder>)[0].uri.fsPath;
    settings.rootDirectory.should.be.equal(rootFolder);
  });

  it('should not throw an exception when instantiating a build tree directory resolver with an incorrect setting.', () => {
    const settings = new ExtensionSettings();

    settings.buildTreeDirectory = 'buildz';

    (() => { new FileSystemBuildTreeDirectoryResolver(settings); }).should.not.throw();
  });

  it('should not be possible to access the full path of the build tree directory using a ' +
    'build tree directory resolver instance set up with an incorrect build tree directory in settings.',
    () => {
      const settings = new ExtensionSettings();
      settings.buildTreeDirectory = 'buildz';
      const resolver = new FileSystemBuildTreeDirectoryResolver(settings);

      return resolver.getFullPath().should.eventually.be.rejectedWith(
        "Cannot find the build tree directory. Ensure the 'cmake-llvm-coverage Build Tree Directory' " +
        'setting is correctly set and target to an existing cmake build tree directory.');
    });

  it('should be possible to access the full path of the build tree directory using a ' +
    'build tree directory resolver instance.',
    () => {
      const settings = new ExtensionSettings();
      const resolver = new FileSystemBuildTreeDirectoryResolver(settings);

      return resolver.getFullPath().should.eventually.be.fulfilled;
    });

  it('should not throw when instantiating a cmake process adapter with an incorrect setting.', () => {
    const settings = new ExtensionSettings();
    settings.cmakeCommand = 'cmakez';

    (() => { new RealCmakeProcess(settings); }).should.not.throw();
  });

  it('should throw when attempting to build an assumed valid specified cmake target in settings ' +
    'with an unreachable cmake command', () => {
      const settings = new ExtensionSettings();
      settings.cmakeCommand = 'cmakez';
      const process = new RealCmakeProcess(settings);

      return process.buildCmakeTarget().should.eventually.be.rejectedWith(
        "Cannot find the cmake command. Ensure the 'cmake-llvm-coverage Cmake Command' " +
        'setting is correctly set. Have you verified your PATH environment variable?');
    });

  it('should throw when attempting to build an invalid specified cmake target in settings ' +
    'with a reachable cmake command', () => {
      prependLlvmBinDirToPathEnvironmentVariable();

      const settings = new ExtensionSettings();
      settings.cmakeTarget = 'Oh my god! This is clearly an invalid cmake target';
      settings.additionalCmakeOptions.push('-DCMAKE_CXX_COMPILER=clang++', '-G', 'Ninja');

      const process = new RealCmakeProcess(settings, env);

      return process.buildCmakeTarget().should.eventually.be.rejectedWith(
        `Error: Could not build the specified cmake target ${settings.cmakeTarget}. ` +
        "Ensure 'cmake-llvm-coverage Cmake Target' setting is properly set.");
    });

  it('should not throw when attempting to build a valid cmake target specified in settings', () => {
    prependLlvmBinDirToPathEnvironmentVariable();

    const settings = new ExtensionSettings();
    settings.additionalCmakeOptions.push('-DCMAKE_CXX_COMPILER=clang++', '-G', 'Ninja');

    const process = new RealCmakeProcess(settings, env);

    return process.buildCmakeTarget().should.eventually.be.fulfilled;
  });
});

function prependLlvmBinDirToPathEnvironmentVariable() {
  if (env['LLVM_DIR']) {
    const binDir = path.join(env['LLVM_DIR'], 'bin');
    const currentPath = <string>env['PATH'];
    const newPath = `${binDir}${path.delimiter}${currentPath}`;
    env['PATH'] = newPath;
  }
}

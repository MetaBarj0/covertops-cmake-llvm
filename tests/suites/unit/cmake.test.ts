import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

import { Cmake } from '../../../src/domain/services/cmake';

import { workspace, process } from './builders';

import buildFakedVscodeWorkspaceWithWorkspaceFolderAndWithOverridableDefaultSettings =
workspace.buildFakedVscodeWorkspaceWithWorkspaceFolderAndWithOverridableDefaultSettings;

import buildFakeProcess = process.buildFakeProcess;

chai.use(chaiAsPromised);
chai.should();

describe('the behavior of the cmake internal service used to build the target ' +
  'giving the file containing coverage info', () => {
    it('should be instantiated with correct dependencies for process and workspace ' +
      'but throw when asking for building a target with a wrong cmake command setting', () => {
        const workspace = buildFakedVscodeWorkspaceWithWorkspaceFolderAndWithOverridableDefaultSettings({ 'cmakeCommand': '' });
        const process = buildFakeProcess();

        const cmake = new Cmake(workspace, process);

        return cmake.buildTarget().should.eventually.be.rejectedWith(
          "Cannot find the cmake command. Ensure the 'cmake-llvm-coverage: Cmake Command' " +
          'setting is correctly set. Have you verified your PATH environment variable?');
      });

    it('should be instantiated with correct dependencies for process and workspace ' +
      'but throw when asking for building a target with a wrong cmake target setting', () => {
        const workspace = buildFakedVscodeWorkspaceWithWorkspaceFolderAndWithOverridableDefaultSettings({ 'cmakeTarget': '' });
        const process = buildFakeProcess();

        const cmake = new Cmake(workspace, process);

        const target = workspace.getConfiguration('cmake-llvm-coverage').get<string>('cmakeTarget');

        return cmake.buildTarget().should.eventually.be.rejectedWith(
          `Cannot build the cmake target: '${target}'. Make sure the ` +
          "'cmake-llvm-coverage: Cmake Target' setting is correctly set."
        );
      });

    it('should be instantiated with correct dependencies for process and workspace ' +
      'and succeed when asking for building a target with good settings', () => {
        const workspace = buildFakedVscodeWorkspaceWithWorkspaceFolderAndWithOverridableDefaultSettings();
        const process = buildFakeProcess();

        const cmake = new Cmake(workspace, process);

        return cmake.buildTarget().should.eventually.be.fulfilled;
      });
  });
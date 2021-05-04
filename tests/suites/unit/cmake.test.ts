import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

import { Cmake } from '../../../src/domain/services/cmake';

import { workspace, process } from '../../builders/fake-adapters';

import buildFakedVscodeWorkspaceWithWorkspaceFolderAndWithOverridableDefaultSettings =
workspace.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings;

import buildFakeFailingProcess = process.buildFakeFailingProcess;
import buildFakeSucceedingProcess = process.buildFakeSucceedingProcess;

chai.use(chaiAsPromised);
chai.should();

describe('the behavior of the cmake internal service used to build the target ' +
  'giving the file containing coverage info', () => {
    it('should be instantiated with correct dependencies for process for cmake target building and workspace ' +
      'but throw when asking for building a target with a wrong cmake command setting', () => {
        const workspace = buildFakedVscodeWorkspaceWithWorkspaceFolderAndWithOverridableDefaultSettings({ 'cmakeCommand': '' });
        const processForCommand = buildFakeFailingProcess();
        const processForTarget = buildFakeSucceedingProcess();

        const cmake = new Cmake({ workspace, processForCommand, processForTarget });

        return cmake.buildTarget().should.eventually.be.rejectedWith(
          "Cannot find the cmake command. Ensure the 'cmake-llvm-coverage: Cmake Command' " +
          'setting is correctly set. Have you verified your PATH environment variable?');
      });

    it('should be instantiated with correct dependencies for process for cmake command invocation and workspace ' +
      'but throw when asking for building a target with a wrong cmake target setting', () => {
        const workspace = buildFakedVscodeWorkspaceWithWorkspaceFolderAndWithOverridableDefaultSettings({ 'cmakeTarget': '' });
        const processForCommand = buildFakeSucceedingProcess();
        const processForTarget = buildFakeFailingProcess();

        const cmake = new Cmake({ workspace, processForCommand, processForTarget });

        const target = workspace.getConfiguration('cmake-llvm-coverage').get<string>('cmakeTarget');

        return cmake.buildTarget().should.eventually.be.rejectedWith(
          `Error: Could not build the specified cmake target ${target}. ` +
          "Ensure 'cmake-llvm-coverage: Cmake Target' setting is properly set.");
      });

    it('should be instantiated with correct dependencies for all processes and workspace ' +
      'and succeed when asking for building a target with good settings', () => {
        const workspace = buildFakedVscodeWorkspaceWithWorkspaceFolderAndWithOverridableDefaultSettings();
        const processForCommand = buildFakeSucceedingProcess();
        const processForTarget = buildFakeSucceedingProcess();

        const cmake = new Cmake({ workspace, processForCommand, processForTarget });

        return cmake.buildTarget().should.eventually.be.fulfilled;
      });
  });
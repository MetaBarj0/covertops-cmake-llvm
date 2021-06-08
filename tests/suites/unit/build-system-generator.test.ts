import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as definitions from '../../../src/definitions';
import * as BuildSystemGenerator from '../../../src/domain/services/internal/build-system-generator';

import { workspace as w, process as p } from '../../builders/fake-adapters';

describe('the behavior of the cmake internal service used to build the target ' +
  'giving the file containing coverage info', () => {
    it('should be instantiated with correct dependencies for process for cmake target building and workspace ' +
      'but throw when asking for building a target with a wrong cmake command setting', () => {
        const workspace = w.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ 'cmakeCommand': '' });
        const processForCommand = p.buildFakeFailingProcess();
        const processForTarget = p.buildFakeSucceedingProcess();

        const cmake = BuildSystemGenerator.make({ workspace, processForCommand, processForTarget });

        return cmake.buildTarget().should.eventually.be.rejectedWith(
          `Cannot find the cmake command. Ensure the '${definitions.extensionNameInSettings}: Cmake Command' ` +
          'setting is correctly set. Have you verified your PATH environment variable?');
      });

    it('should be instantiated with correct dependencies for process for cmake command invocation and workspace ' +
      'but throw when asking for building a target with a wrong cmake target setting', () => {
        const workspace = w.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ 'cmakeTarget': '' });
        const processForCommand = p.buildFakeSucceedingProcess();
        const processForTarget = p.buildFakeFailingProcess();

        const cmake = BuildSystemGenerator.make({ workspace, processForCommand, processForTarget });

        const target = workspace.getConfiguration(definitions.extensionNameInSettings).get('cmakeTarget');

        return cmake.buildTarget().should.eventually.be.rejectedWith(
          `Error: Could not build the specified cmake target ${target}. ` +
          `Ensure '${definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`);
      });

    it('should be instantiated with correct dependencies for all processes and workspace ' +
      'and succeed when asking for building a target with good settings', () => {
        const workspace = w.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
        const processForCommand = p.buildFakeSucceedingProcess();
        const processForTarget = p.buildFakeSucceedingProcess();

        const cmake = BuildSystemGenerator.make({ workspace, processForCommand, processForTarget });

        return cmake.buildTarget().should.eventually.be.fulfilled;
      });
  });
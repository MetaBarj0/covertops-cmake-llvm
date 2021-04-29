import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

import { VscodeWorkspaceConfigurationLike, VscodeWorkspaceLike } from '../../../src/domain/services/settings-provider';

chai.use(chaiAsPromised);
chai.should();

describe('the behavior of the cmake internal service used to build the target ' +
  'giving the file containing coverage info', () => {
    it('should be instantiated with correct dependencies for process and workspace ' +
      'but throw when asking for building a target with a wrong cmake command setting', () => {
        const workspace = buildFakeWorkspace();
        const process = buildFakeProcessForWrongCmakeCommand();

        const cmake = new Cmake(workspace, process);

        cmake.buildTarget().should.eventually.be.rejectedWith(
          "Cannot find the cmake command. Ensure the 'cmake-llvm-coverage Cmake Command' " +
          'setting is correctly set. Have you verified your PATH environment variable?');
      });
  });

type ProcessLike = {};

class Cmake {
  constructor(_workspace: VscodeWorkspaceLike, _process: ProcessLike) { }

  buildTarget(): Promise<void> {
    return Promise.reject(new Error(
      "Cannot find the cmake command. Ensure the 'cmake-llvm-coverage Cmake Command' " +
      'setting is correctly set. Have you verified your PATH environment variable?'));
  }
};

function buildFakeWorkspace() {
  return new class implements VscodeWorkspaceLike {
    workspaceFolders = undefined;

    getConfiguration(_section?: string) {
      return new class implements VscodeWorkspaceConfigurationLike {
        get(_section: string) { return undefined; }
      };
    }
  };
}

function buildFakeProcessForWrongCmakeCommand() {
  return new class implements ProcessLike { };
}

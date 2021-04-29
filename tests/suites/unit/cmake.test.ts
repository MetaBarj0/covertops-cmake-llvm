import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

import { VscodeWorkspaceConfigurationLike, VscodeWorkspaceLike } from '../../../src/domain/services/settings-provider';

chai.use(chaiAsPromised);
chai.should();

describe('the behavior of the cmake internal service used to build the target ' +
  'giving the file containing coverage info', () => {
    it('should be instantiated with correct dependencies for process and workspace', () => {
      const workspace = buildFakeWorkspace();
      const process = buildFakeProcess();

      (() => { new Cmake(workspace, process); }).should.not.throw;
    });
  });

type ProcessLike = {};

class Cmake {
  constructor(_workspace: VscodeWorkspaceLike, _process: ProcessLike) { }
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

function buildFakeProcess() {
  return new class implements ProcessLike { };
}

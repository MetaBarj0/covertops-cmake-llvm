import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';
import { BigIntStats, PathLike, StatOptions, Stats } from 'fs';

import { BuildTreeDirectoryResolver, StatFileLike } from '../../../src/domain/services/build-tree-directory-resolver';
import { VscodeUriLike, VscodeWorkspaceConfigurationLike, VscodeWorkspaceFolderLike, VscodeWorkspaceLike } from '../../../src/domain/services/settings-provider';

chai.use(chaiAsPromised);
chai.should();

describe('how the build tree resolver works with a fake file system stat feature.', () => {
  it('should be instantiated correctly and throw an exception when the build ' +
    'tree directory setting is wrong', () => {
      const fakedWorkspace = buildFakeWorkspace();

      const fakedStatFile = buildFailingFakeStatFile();
      const resolver = new BuildTreeDirectoryResolver(fakedWorkspace, fakedStatFile);

      return resolver.resolveBuildTreeDirectoryRelativePath().should.eventually.be.rejectedWith(
        "Cannot find the build tree directory. Ensure the 'cmake-llvm-coverage Build Tree Directory' " +
        'setting is correctly set and target to an existing cmake build tree directory.');
    });

  it('should be instantiated correctly and resolve when the build ' +
    'tree directory setting is correct', () => {
      const fakedWorkspace = buildFakeWorkspace();

      const fakedStatFile = buildSucceedingFakeStatFile();
      const resolver = new BuildTreeDirectoryResolver(fakedWorkspace, fakedStatFile);

      return resolver.resolveBuildTreeDirectoryRelativePath().should.eventually.be.not.empty;
    });
});

function buildFailingFakeStatFile() {
  return new class implements StatFileLike {
    stat(_path: PathLike, _opts?: StatOptions): Promise<Stats | BigIntStats> {
      return Promise.reject();
    }
  };
}

function buildSucceedingFakeStatFile() {
  return new class implements StatFileLike {
    stat(_path: PathLike, _opts?: StatOptions): Promise<Stats | BigIntStats> {
      return Promise.resolve(new Stats());
    }
  };
}

function buildFakeWorkspace() {
  return new class implements VscodeWorkspaceLike {
    workspaceFolders = [
      new class implements VscodeWorkspaceFolderLike {
        uri = new class implements VscodeUriLike {
          fsPath = '/some/faked/path';
        };
      }];

    getConfiguration(_section?: string | undefined) {
      return new class implements VscodeWorkspaceConfigurationLike {
        get<T>(_section: string) {
          const build: unknown = 'build';
          return <T>build;
        }
      };
    }
  };
}

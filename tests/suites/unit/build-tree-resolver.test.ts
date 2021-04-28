import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';
import { BigIntStats, PathLike, StatOptions, Stats } from 'fs';
import * as path from 'path';

import { Settings } from '../../../src/domain/value-objects/settings';
import { BuildTreeDirectoryResolver, StatFileLike } from '../../../src/domain/services/build-tree-directory-resolver';

chai.use(chaiAsPromised);
chai.should();

describe('how the build tree resolver works with a fake file system stat feature.', () => {
  it('should be instantiated correctly and throw an exception when the build ' +
    'tree directory setting is wrong', () => {
      const fakedSettingsWithWrongBuildDirectory = new Settings('OK', 'KO build tree directory', 'OK', 'OK', 'OK', ['OK']);

      const fakedStatFile = buildFailingFakeStatFile();
      const resolver = new BuildTreeDirectoryResolver(fakedSettingsWithWrongBuildDirectory, fakedStatFile);

      return resolver.resolveBuildTreeDirectoryRelativePath().should.eventually.be.rejectedWith(
        "Cannot find the build tree directory. Ensure the 'cmake-llvm-coverage Build Tree Directory' " +
        'setting is correctly set and target to an existing cmake build tree directory.');
    });

  it('should be instantiated correctly and resolve when the build ' +
    'tree directory setting is correct', () => {
      const workspaceDirectory = path.resolve('root', 'workspace');

      const fakedSettingsWithCorrectBuildDirectory = new Settings('OK', 'build', 'OK', 'OK', workspaceDirectory, ['OK']);

      const fakedStatFile = buildSucceedingFakeStatFile();
      const resolver = new BuildTreeDirectoryResolver(fakedSettingsWithCorrectBuildDirectory, fakedStatFile);

      const buildTreeDirectoryAbsolutePath = path.join(workspaceDirectory, fakedSettingsWithCorrectBuildDirectory.buildTreeDirectory);
      return resolver.resolveBuildTreeDirectoryRelativePath().should.eventually.be.equal(buildTreeDirectoryAbsolutePath);
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

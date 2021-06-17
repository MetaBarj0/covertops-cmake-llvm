import * as BuildTreeDirectoryResolver from '../../src/domain/services/internal/build-tree-directory-resolver';
import { BigIntStats, PathLike, StatOptions, Stats } from 'fs';

export namespace statFile {
  export function buildFakeFailingStatFile(): BuildTreeDirectoryResolver.StatFileLike {
    return new class implements BuildTreeDirectoryResolver.StatFileLike {
      stat(_path: PathLike, _opts?: StatOptions) {
        return Promise.reject();
      }
    };
  }

  export function buildFakeSucceedingStatFile(): BuildTreeDirectoryResolver.StatFileLike {
    return new class implements BuildTreeDirectoryResolver.StatFileLike {
      stat(_path: PathLike, _opts?: StatOptions) {
        return Promise.resolve(new Stats());
      }
    };
  }
}

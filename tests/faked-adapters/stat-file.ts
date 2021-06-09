import * as BuildTreeDirectoryResolver from '../../src/domain/services/internal/build-tree-directory-resolver';
import { BigIntStats, PathLike, StatOptions, Stats } from 'fs';

export namespace statFile {
  export function buildFakeFailingStatFile() {
    return new class implements BuildTreeDirectoryResolver.StatFileLike {
      stat(_path: PathLike, _opts?: StatOptions): Promise<Stats | BigIntStats> {
        return Promise.reject();
      }
    };
  }

  export function buildFakeSucceedingStatFile() {
    return new class implements BuildTreeDirectoryResolver.StatFileLike {
      stat(_path: PathLike, _opts?: StatOptions): Promise<Stats | BigIntStats> {
        return Promise.resolve(new Stats());
      }
    };
  }
}

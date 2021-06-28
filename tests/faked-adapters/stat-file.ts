import * as BuildTreeDirectoryResolver from '../../src/domain/services/internal/build-tree-directory-resolver';
import { PathLike, StatOptions, Stats } from 'fs';

export namespace statFile {
  export function buildFakeFailingStatFile(): BuildTreeDirectoryResolver.StatFileCallable {
    return (_path: PathLike, _opts?: StatOptions) => Promise.reject();
  };

  export function buildFakeSucceedingStatFile(): BuildTreeDirectoryResolver.StatFileCallable {
    return (_path: PathLike, _opts?: StatOptions) => Promise.resolve(new Stats());
  };
}
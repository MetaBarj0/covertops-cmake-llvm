import * as BuildTreeDirectoryResolver from '../../../src/domain/services/internal/build-tree-directory-resolver';

import { MakeDirectoryOptions, PathLike } from 'fs';

export namespace mkDir {
  export function buildFakeFailingMkDir() {
    return new class implements BuildTreeDirectoryResolver.MkDirLike {
      mkdir(_path: PathLike, _options: MakeDirectoryOptions & { recursive: true; }): Promise<string | undefined> {
        return Promise.reject();
      }
    };
  }

  export function buildFakeSucceedingMkDir() {
    return new class implements BuildTreeDirectoryResolver.MkDirLike {
      mkdir(_path: PathLike, _options: MakeDirectoryOptions & { recursive: true; }): Promise<string | undefined> {
        return Promise.resolve('/build/tree/directory');
      }
    };
  }
}
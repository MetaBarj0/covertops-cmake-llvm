import * as BuildTreeDirectoryResolver from '../../src/domain/services/internal/build-tree-directory-resolver';

import { MakeDirectoryOptions, PathLike } from 'fs';

export namespace fs {
  export function buildFakeFailingFs() {
    return new class implements BuildTreeDirectoryResolver.FsLike {
      mkdir(_path: PathLike, _options: MakeDirectoryOptions & { recursive: true; }): Promise<string | undefined> {
        return Promise.reject();
      }
    };
  }

  export function buildFakeSucceedingFs() {
    return new class implements BuildTreeDirectoryResolver.FsLike {
      mkdir(_path: PathLike, _options: MakeDirectoryOptions & { recursive: true; }): Promise<string | undefined> {
        return Promise.resolve('/build/tree/directory');
      }
    };
  }
}
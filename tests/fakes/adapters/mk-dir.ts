import { MkdirCallable } from '../../../src/shared-kernel/abstractions/file-system';

import { MakeDirectoryOptions, PathLike } from 'fs';

export namespace mkDir {
  export function buildFakeFailingMkDir(): MkdirCallable {
    return (_path: PathLike, _options: MakeDirectoryOptions & { recursive: true; }): Promise<string | undefined> => Promise.reject();
  }

  export function buildFakeSucceedingMkDir(): MkdirCallable {
    return (_path: PathLike, _options: MakeDirectoryOptions & { recursive: true; }): Promise<string | undefined> => Promise.resolve('/build/tree/directory');
  }
}
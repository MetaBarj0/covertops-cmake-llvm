import { StatFileCallable } from '../../src/adapters/interfaces/stat-file-callable';

import { PathLike, StatOptions, Stats } from 'fs';

// TODO: rework namespaces as contracts
export namespace statFile {
  export function buildFakeFailingStatFile(): StatFileCallable {
    return (_path: PathLike, _opts?: StatOptions) => Promise.reject();
  };

  export function buildFakeSucceedingStatFile(): StatFileCallable {
    return (_path: PathLike, _opts?: StatOptions) => Promise.resolve(new Stats());
  };
}
import { StatCallable } from '../../../src/adapters/interfaces/file-system';

import { PathLike, StatOptions, Stats } from 'fs';

// TODO: rework namespaces as contracts
export namespace statFile {
  export function buildFakeFailingStatFile(): StatCallable {
    return (_path: PathLike, _opts?: StatOptions) => Promise.reject();
  };

  export function buildFakeSucceedingStatFile(): StatCallable {
    return (_path: PathLike, _opts?: StatOptions) => Promise.resolve(new Stats());
  };
}
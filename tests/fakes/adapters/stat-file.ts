import { StatCallable } from '../../../src/shared-kernel/abstractions/file-system';

import { PathLike, StatOptions, Stats } from 'fs';

export function buildFakeFailingStatFile(): StatCallable {
  return (_path: PathLike, _opts?: StatOptions) => Promise.reject();
};

export function buildFakeSucceedingStatFile(): StatCallable {
  return (_path: PathLike, _opts?: StatOptions) => Promise.resolve(new Stats());
};
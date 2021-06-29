import { promises as fs } from 'fs';
import * as globby from 'globby';
import { GlobSearchCallable, MkdirCallable, StatFileCallable } from './interfaces/file-system';

export namespace fileSystem {
  export const stat: StatFileCallable = fs.stat;
  export const globSearch: GlobSearchCallable = globby;
  export const mkdir: MkdirCallable = fs.mkdir;
}
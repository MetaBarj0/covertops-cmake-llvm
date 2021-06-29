import { promises as fs } from 'fs';
import * as globby from 'globby';
import { GlobSearchCallable, StatFileCallable } from './interfaces/file-system';

export namespace fileSystem {
  export const stat: StatFileCallable = fs.stat;
  export const globSearch: GlobSearchCallable = globby;
  export const makeDirectory = { mkdir: fs.mkdir };
}
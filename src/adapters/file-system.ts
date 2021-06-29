import { promises as fs, createReadStream } from 'fs';
import * as globby from 'globby';
import { CreateReadStreamCallable, GlobSearchCallable, MkdirCallable, StatFileCallable } from './interfaces/file-system';

export const stat: StatFileCallable = fs.stat;
export const globSearch: GlobSearchCallable = globby;
export const mkdir: MkdirCallable = fs.mkdir;
export const readableStream: CreateReadStreamCallable = createReadStream;
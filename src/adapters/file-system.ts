import { promises as fs, createReadStream as crs } from 'fs';
import * as globby from 'globby';
import { CreateReadStreamCallable, GlobSearchCallable, MkdirCallable, StatCallable } from '../shared-kernel/abstractions/file-system';

export const stat: StatCallable = fs.stat;
export const globSearch: GlobSearchCallable = globby;
export const mkdir: MkdirCallable = fs.mkdir;
export const createReadStream: CreateReadStreamCallable = crs;
import { BigIntStats, MakeDirectoryOptions, PathLike, StatOptions, Stats } from 'fs';
import { Readable } from 'stream';

export type StatFileCallable = (path: PathLike, opts?: StatOptions) => Promise<Stats | BigIntStats>;
export type GlobSearchCallable = (pattern: string) => Promise<ReadonlyArray<string>>;
export type MkdirCallable = (path: PathLike, options: MakeDirectoryOptions & { recursive: true; }) => Promise<string | undefined>;
export type CreateReadStreamCallable = (path: string) => Readable;
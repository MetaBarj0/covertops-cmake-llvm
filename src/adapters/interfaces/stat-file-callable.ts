import { BigIntStats, PathLike, StatOptions, Stats } from 'fs';

export type StatFileCallable = (path: PathLike, opts?: StatOptions) => Promise<Stats | BigIntStats>;

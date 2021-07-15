import {
  MkdirCallable,
  StatCallable,
  CreateReadStreamCallable,
  GlobSearchCallable
} from '../../../src/adapters/abstractions/file-system';

import { MakeDirectoryOptions, PathLike, StatOptions, Stats } from 'fs';
import { Readable } from 'stream';

export function buildFakeGlobSearchForNoMatch(): GlobSearchCallable {
  return (_pattern: string) => Promise.resolve([]);
}

export function buildFakeGlobSearchForSeveralMatch(): GlobSearchCallable {
  return (_pattern: string) => Promise.resolve(['', '']);
}

export function buildFakeGlobSearchForExactlyOneMatch(): GlobSearchCallable {
  return (_pattern: string) => Promise.resolve(['oneMatchShow']);
}

export function buildEmptyReadableStream() {
  const empty = (function* () { })();

  return Readable.from(empty);
}

export function buildNotJsonStream() {
  return Readable.from('foo');
}

export function buildInvalidLlvmCoverageJsonObjectStream() {
  return Readable.from(JSON.stringify({
    data: [
      { foo: 'bar' },
      {}
    ]
  }));
}

export function buildValidLlvmCoverageJsonObjectStream() {
  return Readable.from(JSON.stringify({
    "data": [
      {
        "files": [
          {
            "filename": "/a/source/file.cpp",
            "summary": {
              "regions": {
                "count": 2,
                "covered": 2,
                "notcovered": 0,
                "percent": 100
              }
            }
          }
        ],
        "functions": [
          {
            "filenames": [
              "/a/source/file.cpp"
            ],
            "regions": [
              [
                4,
                52,
                4,
                54,
                1,
                0,
                0,
                0
              ],
              [
                6,
                53,
                6,
                71,
                0,
                0,
                0,
                0
              ]
            ]
          }
        ]
      }
    ],
    "type": "llvm.coverage.json.export",
    "version": "2.0.1"
  }));
}

export function buildFakeStreamBuilder(factory: () => Readable): CreateReadStreamCallable {
  return (_path: string) => factory();
}

export function buildFakeFailingMkDir(): MkdirCallable {
  return (_path: PathLike, _options: MakeDirectoryOptions & { recursive: true; }): Promise<string | undefined> => Promise.reject();
}

export function buildFakeSucceedingMkDir(): MkdirCallable {
  return (_path: PathLike, _options: MakeDirectoryOptions & { recursive: true; }): Promise<string | undefined> => Promise.resolve('/build/tree/directory');
}

export function buildFakeFailingStatFile(): StatCallable {
  return (_path: PathLike, _opts?: StatOptions) => Promise.reject();
};

export function buildFakeSucceedingStatFile(): StatCallable {
  return (_path: PathLike, _opts?: StatOptions) => Promise.resolve(new Stats());
};
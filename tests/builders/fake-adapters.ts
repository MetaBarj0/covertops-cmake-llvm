import {
  VscodeWorkspaceLike,
  VscodeWorkspaceFolderLike,
  VscodeUriLike,
  VscodeWorkspaceConfigurationLike
} from '../../src/domain/services/settings-provider';

import {
  ChildProcessLike,
  ExecFileExceptionLike,
  ExecFileOptionsLike,
  ProcessLike
} from '../../src/domain/services/build-system-generator';

import * as BuildTreeDirectoryResolver from '../../src/domain/services/internal/build-tree-directory-resolver';
import { Settings } from '../../src/domain/value-objects/settings';
import { GlobSearchLike } from '../../src/domain/services/coverage-info-file-resolver';
import { LLVMCoverageInfoStreamBuilder } from '../../src/domain/services/coverage-info-collector';

import * as path from 'path';
import { BigIntStats, MakeDirectoryOptions, PathLike, StatOptions, Stats } from 'fs';
import { Readable } from 'stream';

export namespace workspace {
  type Overrides = {
    -readonly [k in keyof Settings]?: any
  };

  export function buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(overrides: Overrides = {}): VscodeWorkspaceLike {
    return new class implements VscodeWorkspaceLike {
      constructor(overrides: Overrides) {
        this.overrides = overrides;
      }

      workspaceFolders = [
        new class implements VscodeWorkspaceFolderLike {
          uri = new class implements VscodeUriLike {
            fsPath = path.resolve('.');
          };
        }];

      getConfiguration(_section?: string) {
        return new class implements VscodeWorkspaceConfigurationLike {
          constructor(overrides: Overrides) {
            this.overrides = overrides;
          }

          get<T>(section: keyof Settings): T | undefined {
            if (this.overrides[section] !== undefined)
              return this.overrides[section];

            switch (section) {
              case 'additionalCmakeOptions':
                return [] as unknown as T | undefined;
              case 'buildTreeDirectory':
                return 'build' as unknown as T | undefined;
              case 'cmakeCommand':
                return 'cmake' as unknown as T | undefined;
              case 'cmakeTarget':
                return 'coverage' as unknown as T | undefined;
              case 'coverageInfoFileName':
                return 'coverage.json' as unknown as T | undefined;
              case 'rootDirectory':
                return '.' as unknown as T | undefined;
            }
          }

          private overrides: Overrides;
        }(this.overrides);
      }

      private overrides: Overrides;
    }(overrides);
  }

  export function buildFakeWorkspaceWithoutWorkspaceFolderAndWithoutSettings(): VscodeWorkspaceLike {
    return new class implements VscodeWorkspaceLike {
      workspaceFolders = undefined;

      getConfiguration(_section?: string) {
        return new class implements VscodeWorkspaceConfigurationLike {
          get(_section: string) { return undefined; }
        };
      };
    };
  }
}

export namespace process {
  export function buildFakeFailingProcess() {
    return new class implements ProcessLike {
      execFile(
        _file: string,
        _args: readonly string[] | null | undefined,
        _options: ExecFileOptionsLike,
        callback: (error: ExecFileExceptionLike | null, stdout: string, stderr: string) => void): ChildProcessLike {
        callback(
          new class implements ExecFileExceptionLike {
            message = 'Epic fail!';
          },
          'stdout',
          'stderr');

        return new class implements ChildProcessLike { };
      }
    };
  }

  export function buildFakeSucceedingProcess() {
    return new class implements ProcessLike {
      execFile(
        _file: string,
        _args: readonly string[] | null | undefined,
        _options: ExecFileOptionsLike,
        callback: (error: ExecFileExceptionLike | null, stdout: string, stderr: string) => void): ChildProcessLike {
        callback(null, 'epic success!', '');

        return new class implements ChildProcessLike { };
      }
    };
  }
}

export namespace stream {
  export function buildEmptyReadableStream(): Readable {
    const empty = (function* () { })();

    return Readable.from(empty);
  }

  export function buildNotJsonStream(): Readable {
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

  export function buildFakeStreamBuilder(streamFactory: () => Readable) {
    return new class implements LLVMCoverageInfoStreamBuilder {
      makeLLVMCoverageInfoStream() {
        return streamFactory();
      }
    };
  }
}

export namespace statFile {
  export function buildFakeFailingStatFile() {
    return new class implements BuildTreeDirectoryResolver.StatFileLike {
      stat(_path: PathLike, _opts?: StatOptions): Promise<Stats | BigIntStats> {
        return Promise.reject();
      }
    };
  }

  export function buildFakeSucceedingStatFile() {
    return new class implements BuildTreeDirectoryResolver.StatFileLike {
      stat(_path: PathLike, _opts?: StatOptions): Promise<Stats | BigIntStats> {
        return Promise.resolve(new Stats());
      }
    };
  }
}

export namespace glob {
  export function buildFakeGlobSearchForNoMatch() {
    return new class implements GlobSearchLike {
      search(_pattern: string) {
        return Promise.resolve([]);
      }
    };
  }

  export function buildFakeGlobSearchForSeveralMatch() {
    return new class implements GlobSearchLike {
      search(_pattern: string) {
        return Promise.resolve(['', '']);
      }
    };
  }

  export function buildFakeGlobSearchForExactlyOneMatch() {
    return new class implements GlobSearchLike {
      search(_pattern: string) {
        return Promise.resolve(['oneMatchShow']);
      }
    };
  }
}

export namespace fs {
  export function buildFakeFailingFs() {
    return new class implements BuildTreeDirectoryResolver.FsLike {
      mkdir(_path: PathLike, _options: MakeDirectoryOptions & { recursive: true; }): Promise<string | undefined> {
        return Promise.reject();
      }
    };
  }

  export function buildFakeSucceedingFs() {
    return new class implements BuildTreeDirectoryResolver.FsLike {
      mkdir(_path: PathLike, _options: MakeDirectoryOptions & { recursive: true; }): Promise<string | undefined> {
        return Promise.resolve('/build/tree/directory');
      }
    };
  }
}
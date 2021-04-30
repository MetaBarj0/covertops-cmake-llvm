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
} from '../../src/domain/services/cmake';

import { StatFileLike } from '../../src/domain/services/build-tree-directory-resolver';

import * as path from 'path';
import { Readable } from 'stream';
import { BigIntStats, PathLike, StatOptions, Stats } from 'fs';

export namespace workspace {
  type Overrides = {
    [key: string]: any
  };

  export function buildFakedVscodeWorkspaceWithWorkspaceFolderAndWithOverridableDefaultSettings(overrides: Overrides = {}): VscodeWorkspaceLike {
    return new class implements VscodeWorkspaceLike {
      constructor(overrides: Overrides) {
        this.overrides = overrides;
      }

      workspaceFolders = [
        new class implements VscodeWorkspaceFolderLike {
          uri = new class implements VscodeUriLike {
            fsPath = path.resolve('some', 'fake', 'path');
          };
        }];

      getConfiguration(_section?: string) {
        return new class implements VscodeWorkspaceConfigurationLike {
          constructor(overrides: Overrides) {
            this.overrides = overrides;
          }

          get<T>(section: string): T | undefined {
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
                return 'reportCoverageDetails' as unknown as T | undefined;
              case 'coverageInfoFileName':
                return 'default.covdata.json' as unknown as T | undefined;
              default:
                return undefined;
            }
          }

          private overrides: Overrides;
        }(this.overrides);
      }

      private overrides: Overrides;
    }(overrides);
  }

  export function buildFakedVscodeWorkspaceWithoutWorkspaceFolderAndWithoutSettings(): VscodeWorkspaceLike {
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
  export function buildFakeProcess() {
    return new class implements ProcessLike {
      execFile(file: string,
        args: readonly string[] | null | undefined,
        _options: ExecFileOptionsLike,
        callback: (error: ExecFileExceptionLike | null, stdout: string, stderr: string) => void) {
        const childProcess = new class implements ChildProcessLike { };
        if (!args)
          return childProcess;

        callback(this.getPotentialError(file, args),
          'stdout',
          'stderr');

        return childProcess;
      }

      private getPotentialError(file: string, args: ReadonlyArray<string>): ExecFileExceptionLike | null {
        const potentialError = [
          this.getCmakeCommandPotentialError(file),
          this.getCmakeTargetPotentialError(args)]
          .find(potentialError => {
            return potentialError !== null;
          });

        if (potentialError)
          return potentialError;

        return null;
      }

      private getCmakeCommandPotentialError(file: string) {
        if (!file)
          return new class implements ExecFileExceptionLike {
            message = `"${file}": command not found.`;
          };

        return null;
      }

      private getCmakeTargetPotentialError(args: ReadonlyArray<string>) {
        const targetFlagIndex = args.indexOf('--target');
        if (targetFlagIndex === -1)
          return null;

        const target = args[targetFlagIndex + 1];

        if (target)
          return null;
        return new class implements ExecFileExceptionLike {
          message = `"${target}": incorrect target`;
        };
      }
    };
  }
}

export namespace stream {
  export function buildEmptyInputStream(): Readable {
    const empty = (function* () { })();

    return Readable.from(empty);
  }

  export function buildNotJsonStream(): Readable {
    return Readable.from('foo');
  }

  export function buildEmptyJsonObjectStream(): Readable {
    return Readable.from(JSON.stringify({}));
  }
}

export namespace statFile {
  export function buildFailingFakeStatFile() {
    return new class implements StatFileLike {
      stat(_path: PathLike, _opts?: StatOptions): Promise<Stats | BigIntStats> {
        return Promise.reject();
      }
    };
  }

  export function buildSucceedingFakeStatFile() {
    return new class implements StatFileLike {
      stat(_path: PathLike, _opts?: StatOptions): Promise<Stats | BigIntStats> {
        return Promise.resolve(new Stats());
      }
    };
  }
}
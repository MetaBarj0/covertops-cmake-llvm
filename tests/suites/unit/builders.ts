import {
  VscodeWorkspaceLike,
  VscodeWorkspaceFolderLike,
  VscodeUriLike,
  VscodeWorkspaceConfigurationLike
} from '../../../src/domain/services/settings-provider';

import * as path from 'path';

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
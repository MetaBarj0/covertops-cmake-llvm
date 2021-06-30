import { defaultSetting } from '../../utils/settings';

import { Settings } from '../../../src/modules/settings-provider/abstractions/domain/settings';
import {
  VscodeUriLike,
  VscodeWorkspaceConfigurationLike,
  VscodeWorkspaceFolderLike, VscodeWorkspaceLike
} from '../../../src/shared-kernel/abstractions/vscode';

type Overrides = {
  -readonly [Property in keyof Settings]?: Settings[Property]
};

export function buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(overrides: Overrides = {}): VscodeWorkspaceLike {
  return new class implements VscodeWorkspaceLike {
    constructor(overrides: Overrides) {
      this.overrides = overrides;
    }

    workspaceFolders = [
      new class implements VscodeWorkspaceFolderLike {
        uri = new class implements VscodeUriLike {
          fsPath = defaultSetting('rootDirectory').toString();
        };
      }];

    getConfiguration(_section?: string) {
      return new class implements VscodeWorkspaceConfigurationLike {
        constructor(overrides: Overrides) {
          this.overrides = overrides;
        }

        get(section: keyof Settings) {
          if (this.overrides[section])
            return <Settings[typeof section]>this.overrides[section];

          return defaultSetting(section);
        }

        async update(_section: string, _value: any) { }

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
        get(section: keyof Settings) {
          return defaultSetting(section);
        }

        async update(_section: string, _value: any) { }
      };
    };
  };
}

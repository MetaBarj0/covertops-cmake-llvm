import { defaultSetting } from '../utils/settings';

import * as SettingsProvider from '../../src/domain/services/internal/settings-provider';
import { SettingsContract } from '../../src/domain/interfaces/settings-contract';

export namespace vscodeWorkspace {
  type Overrides = {
    -readonly [Property in keyof SettingsContract]?: SettingsContract[Property]
  };

  export function buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(overrides: Overrides = {}): SettingsProvider.VscodeWorkspaceLike {
    return new class implements SettingsProvider.VscodeWorkspaceLike {
      constructor(overrides: Overrides) {
        this.overrides = overrides;
      }

      workspaceFolders = [
        new class implements SettingsProvider.VscodeWorkspaceFolderLike {
          uri = new class implements SettingsProvider.VscodeUriLike {
            fsPath = defaultSetting('rootDirectory').toString();
          };
        }];

      getConfiguration(_section?: string) {
        return new class implements SettingsProvider.VscodeWorkspaceConfigurationLike {
          constructor(overrides: Overrides) {
            this.overrides = overrides;
          }

          get(section: keyof SettingsContract) {
            if (this.overrides[section])
              return <SettingsContract[typeof section]>this.overrides[section];

            return defaultSetting(section);
          }

          private overrides: Overrides;
        }(this.overrides);
      }

      private overrides: Overrides;
    }(overrides);
  }

  export function buildFakeWorkspaceWithoutWorkspaceFolderAndWithoutSettings(): SettingsProvider.VscodeWorkspaceLike {
    return new class implements SettingsProvider.VscodeWorkspaceLike {
      workspaceFolders = undefined;

      getConfiguration(_section?: string) {
        return new class implements SettingsProvider.VscodeWorkspaceConfigurationLike {
          get(section: keyof SettingsContract) {
            return defaultSetting(section);
          }
        };
      };
    };
  }
}

import * as SettingsProvider from '../../src/domain/services/internal/settings-provider';
import { defaultSetting, Settings } from '../../src/domain/value-objects/settings';
import * as path from 'path';

export namespace vscodeWorkspace {
  type Overrides = {
    -readonly [Property in keyof Settings]?: Settings[Property]
  };

  export function buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(overrides: Overrides = {}): SettingsProvider.VscodeWorkspaceLike {
    return new class implements SettingsProvider.VscodeWorkspaceLike {
      constructor(overrides: Overrides) {
        this.overrides = overrides;
      }

      workspaceFolders = [
        new class implements SettingsProvider.VscodeWorkspaceFolderLike {
          uri = new class implements SettingsProvider.VscodeUriLike {
            fsPath = path.resolve('.');
          };
        }];

      getConfiguration(_section?: string) {
        return new class implements SettingsProvider.VscodeWorkspaceConfigurationLike {
          constructor(overrides: Overrides) {
            this.overrides = overrides;
          }

          get(section: keyof Settings) {
            if (this.overrides[section])
              return <Settings[typeof section]>this.overrides[section];

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
          get(section: keyof Settings) {
            return defaultSetting(section);
          }
        };
      };
    };
  }
}

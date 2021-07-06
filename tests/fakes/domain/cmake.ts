import { Cmake } from '../../../src/modules/cmake/domain/abstractions/cmake';
import { BasicCmake } from '../../../src/modules/cmake/domain/implementations/basic-cmake';
import { buildFakeProgressReporter } from '../adapters/progress-reporter';
import * as SettingsProvider from '../../../src/modules/settings-provider/domain/implementations/settings-provider';
import { buildFakeErrorChannel } from '../adapters/error-channel';
import { buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings } from '../adapters/vscode';
import * as Definitions from '../../../src/extension/definitions';

export function buildUnreachableCmake(): Cmake {
  return new class extends BasicCmake implements Cmake {
    constructor() {
      super(buildFakeProgressReporter(), defaultSettings());
    }

    protected reachCommand() {
      return Promise.reject(`Cannot find the cmake command. Ensure the '${Definitions.extensionNameInSettings}: Cmake Command' ` +
        'setting is correctly set. Have you verified your PATH environment variable?');
    }

    protected async generateProject() { }
    protected async build() { }
  };
}

export function buildCmakeFailingAtGeneratingProject(): Cmake {
  return new class extends BasicCmake implements Cmake {
    constructor() {
      super(buildFakeProgressReporter(), defaultSettings());
    }

    protected async reachCommand() { }

    protected async generateProject() {
      return Promise.reject('Cannot generate the cmake project in the ' +
        `${this.settings.rootDirectory} directory. ` +
        'Ensure either you have opened a valid cmake project, or the cmake project has not already been generated using different options. ' +
        `You may have to take a look in '${Definitions.extensionNameInSettings}: Additional Cmake Options' settings ` +
        'and check the generator used is correct for instance.');
    }

    protected async build() { }
  };
}

export function buildCmakeFailingAtBuildingTarget() {
  return new class extends BasicCmake implements Cmake {
    constructor() {
      super(buildFakeProgressReporter(), defaultSettings());
    }

    protected async reachCommand() { }
    protected async generateProject() { }

    protected build() {
      return Promise.reject(`Error: Could not build the specified cmake target ${this.settings.cmakeTarget}. ` +
        `Ensure '${Definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`);
    }
  };
}

function defaultSettings() {
  return SettingsProvider.make({
    errorChannel: buildFakeErrorChannel(),
    workspace: buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings()
  }).settings;
}
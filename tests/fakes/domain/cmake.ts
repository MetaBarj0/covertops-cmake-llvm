import { Cmake } from '../../../src/modules/cmake/domain/abstractions/cmake';
import { buildFakeProgressReporter } from '../adapters/progress-reporter';
import * as SettingsProvider from '../../../src/modules/settings-provider/domain/implementations/settings-provider';
import * as CmakeModule from '../../../src/modules/cmake/domain/implementations/cmake';
import { buildFakeErrorChannel } from '../adapters/error-channel';
import { buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings } from '../adapters/vscode';

export function buildUnreachableCmake(context?: Context): Cmake {
  return new class extends CmakeModule.BasicCmake implements Cmake {
    constructor() {
      super(...buildBasicCmakeConstructorArgumentsFromContext(context));
    }

    protected reachCommand() {
      return Promise.reject(new Error);
    }

    protected async generateProject() { }
    protected async build() { }
  };
}

export function buildCmakeFailingAtGeneratingProject(context?: Context): Cmake {
  return new class extends CmakeModule.BasicCmake implements Cmake {
    constructor() {
      super(...buildBasicCmakeConstructorArgumentsFromContext(context));
    }

    protected async reachCommand() { }

    protected async generateProject() {
      return Promise.reject(new Error);
    }

    protected async build() { }
  };
}

export function buildCmakeFailingAtBuildingTarget(context?: Context) {
  return new class extends CmakeModule.BasicCmake implements Cmake {
    constructor() {
      super(...buildBasicCmakeConstructorArgumentsFromContext(context));
    }

    protected async reachCommand() { }
    protected async generateProject() { }

    protected build() {
      return Promise.reject(new Error);
    }
  };
}

export function buildFakeSucceedingCmake(context?: Context) {
  return new class extends CmakeModule.BasicCmake implements Cmake {
    constructor() {
      super(...buildBasicCmakeConstructorArgumentsFromContext(context));
    }

    protected async reachCommand() { }
    protected async generateProject() { }
    protected async build() { }
  };
}

function buildDefaultSettings() {
  return SettingsProvider.make({
    errorChannel: buildFakeErrorChannel(),
    workspace: buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings()
  }).settings;
}

type Context = typeof CmakeModule.make extends (context: infer T) => Cmake ? T : never;

type BasicCmakeConstructorArguments = ConstructorParameters<typeof CmakeModule.BasicCmake>;

function buildBasicCmakeConstructorArgumentsFromContext(context?: Context): BasicCmakeConstructorArguments {
  const errorChannel = context ? context.errorChannel : buildFakeErrorChannel();
  const progressReporter = context ? context.progressReporter : buildFakeProgressReporter();
  const settings = context ? context.settings : buildDefaultSettings();

  return [errorChannel, progressReporter, settings];
}
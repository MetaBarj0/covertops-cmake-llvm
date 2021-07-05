import { Cmake } from '../../../src/modules/cmake/domain/abstractions/cmake';
import { BasicCmake } from '../../../src/modules/cmake/domain/implementations/basic-cmake';
import { buildFakeProgressReporter } from '../adapters/progress-reporter';
import * as Definitions from '../../../src/extension/definitions';

export function buildUnreachableCmake(): Cmake {
  return new class extends BasicCmake implements Cmake {
    constructor() {
      super(buildFakeProgressReporter());
    }

    protected reachCommand() {
      return Promise.reject(`Cannot find the cmake command. Ensure the '${Definitions.extensionNameInSettings}: Cmake Command' ` +
        'setting is correctly set. Have you verified your PATH environment variable?');
    }

    protected async generateProject() { }
    protected async build() { }
  };
}

export function buildCmakeFailingAtBuildingTarget() {
  return new class extends BasicCmake implements Cmake {
    constructor() {
      super(buildFakeProgressReporter());
    }

    protected async reachCommand() { }
    protected async generateProject() { }

    protected build() {
      return Promise.reject(`Error: Could not build the specified cmake target ${target}. ` +
        `Ensure '${Definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`);
    }
  };
}
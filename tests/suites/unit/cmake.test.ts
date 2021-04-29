import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

import { SettingsProvider, VscodeUriLike, VscodeWorkspaceConfigurationLike, VscodeWorkspaceFolderLike, VscodeWorkspaceLike } from '../../../src/domain/services/settings-provider';
import * as path from 'path';

chai.use(chaiAsPromised);
chai.should();

describe('the behavior of the cmake internal service used to build the target ' +
  'giving the file containing coverage info', () => {
    it('should be instantiated with correct dependencies for process and workspace ' +
      'but throw when asking for building a target with a wrong cmake command setting', () => {
        const workspace = buildFakeWorkspace();
        const process = buildFakeProcessForWrongCmakeCommand();

        const cmake = new Cmake(workspace, process);

        return cmake.buildTarget().should.eventually.be.rejectedWith(
          "Cannot find the cmake command. Ensure the 'cmake-llvm-coverage Cmake Command' " +
          'setting is correctly set. Have you verified your PATH environment variable?');
      });
  });

type ExecFileOptionsLike = {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
};

type ExecFileExceptionLike = {
  message: string;
};

type ChildProcessLike = {};

type ProcessLike = {
  execFile(
    file: string,
    args: ReadonlyArray<string> | undefined | null,
    options: ExecFileOptionsLike,
    callback: (error: ExecFileExceptionLike | null, stdout: string, stderr: string) => void
  ): ChildProcessLike;
};

class Cmake {
  constructor(workspace: VscodeWorkspaceLike, process: ProcessLike) {
    this.process = process;
    this.workspace = workspace;
  }

  buildTarget(): Promise<void> {
    return new Promise((resolve, reject) => {
      const settings = new SettingsProvider(this.workspace).settings;
      const cmakeCommand = settings.cmakeCommand;

      this.process.execFile(
        cmakeCommand, ['--version'], {},
        (error, _stdout, _stderr) => {
          if (error)
            return reject(new Error(
              "Cannot find the cmake command. Ensure the 'cmake-llvm-coverage Cmake Command' " +
              'setting is correctly set. Have you verified your PATH environment variable?'));

          resolve();
        });
    });
  }

  private readonly process: ProcessLike;
  private readonly workspace: VscodeWorkspaceLike;
};

function buildFakeWorkspace() {
  return new class implements VscodeWorkspaceLike {
    workspaceFolders = [
      new class implements VscodeWorkspaceFolderLike {
        uri = new class implements VscodeUriLike {
          fsPath = path.resolve('root', 'workspace');
        };
      }
    ];

    getConfiguration(_section?: string) {
      return new class implements VscodeWorkspaceConfigurationLike {
        get(_section: string) { return undefined; }
      };
    }
  };
}

function buildFakeProcessForWrongCmakeCommand() {
  return new class implements ProcessLike {
    execFile(file: string,
      _args: readonly string[] | null | undefined,
      _options: ExecFileOptionsLike,
      callback: (error: ExecFileExceptionLike | null, stdout: string, stderr: string) => void) {
      callback(new class implements ExecFileExceptionLike {
        message = `${file}: command not found.`;
      },
        'stdout',
        'stderr');

      return new class implements ChildProcessLike { };
    }
  };
}

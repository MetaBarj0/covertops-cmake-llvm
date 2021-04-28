import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import {
  SettingsProvider,
  VscodeUriLike,
  VscodeWorkspaceConfigurationLike,
  VscodeWorkspaceFolderLike,
  VscodeWorkspaceLike
} from '../../../src/domain/services/settings-provider';

describe('how the settings provider works with a fake of vscode api for configuration', () => {
  it('should be instantiated correctly with a vscode workspace-like instance and provide ' +
    'settings with correct default values', () => {
      const fakedWorkspace = buildFakedVscodeWorkspaceWithWorkspaceFolder();
      const provider = new SettingsProvider(fakedWorkspace);
      const settings = provider.settings;

      settings.additionalCmakeOptions.should.be.empty;
      settings.buildTreeDirectory.should.be.equal('build');
      settings.cmakeCommand.should.be.equal('cmake');
      settings.cmakeTarget.should.be.equal('reportCoverageDetails');
      settings.coverageInfoFileName.should.be.equal('default.covdata.json');

      const workspaceFolders = fakedWorkspace.workspaceFolders as Array<VscodeWorkspaceFolderLike>;
      const expectedRootDirectory = workspaceFolders[0].uri.fsPath;
      settings.rootDirectory.should.be.equal(expectedRootDirectory);
    });

  it('should be instantiated correctly but throw an exception when workspace folders are not set', () => {
    const fakedWorkspace = buildFakedVscodeWorkspaceWithoutWorkspaceFolder();
    const provider = new SettingsProvider(fakedWorkspace);
    (() => { provider.settings; }).should.throw(
      'A workspace must be loaded to get coverage information.');
  });
});


function buildFakedVscodeWorkspaceWithWorkspaceFolder(): VscodeWorkspaceLike {
  return new class implements VscodeWorkspaceLike {
    getConfiguration = this.getFakedConfiguration;

    workspaceFolders = [
      new class implements VscodeWorkspaceFolderLike {
        uri = new class implements VscodeUriLike {
          fsPath = '/some/faked/path';
        };
      }];

    private getFakedConfiguration() {
      return new class implements VscodeWorkspaceConfigurationLike {
        get<T>(section: string): T | undefined {
          switch (section) {
            case 'additionalCmakeOptions':
              const additionalCmakeOptions: unknown = [];
              return <T | undefined>additionalCmakeOptions;
            case 'buildTreeDirectory':
              const buildTreeDirectory: unknown = 'build';
              return <T | undefined>buildTreeDirectory;
            case 'cmakeCommand':
              const cmakeCommand: unknown = 'cmake';
              return <T | undefined>cmakeCommand;
            case 'cmakeTarget':
              const cmakeTarget: unknown = 'reportCoverageDetails';
              return <T | undefined>cmakeTarget;
            case 'coverageInfoFileName':
              const coverageInfoFileName: unknown = 'default.covdata.json';
              return <T | undefined>coverageInfoFileName;
            default:
              return undefined;
          }
        }
      };
    }
  };
}

function buildFakedVscodeWorkspaceWithoutWorkspaceFolder(): VscodeWorkspaceLike {
  return new class implements VscodeWorkspaceLike {
    workspaceFolders = undefined;
    getConfiguration = this.getUndefinedConfiguration;

    private getUndefinedConfiguration() {
      return new class implements VscodeWorkspaceConfigurationLike {
        get(_: string) { return undefined; }
      };
    }
  };
}



import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as Imports from './imports';

describe('Unit test suite', () => {
  describe('the behavior of the coverage info file resolver', () => {
    describe('failing if the resolver does not find any file', shouldFailWhenNoFileIsFound);
    describe('failing if the resolver finds more than one file', shouldFailWhenMoreThanOneFileAreFound);
    describe('succeeding if the resolver finds exactly one file', shouldSucceedWhenExactlyOneFileIsFound);
  });
});

function shouldFailWhenNoFileIsFound() {
  it('should fail and report in error channel if the recursive search from the build tree directory does not find one file', () => {
    const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const errorChannelSpy = Imports.Fakes.Adapters.vscode.buildSpyOfErrorChannel(Imports.Fakes.Adapters.vscode.buildFakeErrorChannel());
    const errorChannel = errorChannelSpy.object;
    const settings = Imports.Domain.Implementations.SettingsProvider.make({ errorChannel, workspace }).settings;
    const globSearch = Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForNoMatch();
    const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();

    const resolver = Imports.Domain.Implementations.CoverageInfoFileResolver.make({ settings, globSearch, progressReporter, errorChannel });

    return resolver.resolveCoverageInfoFileFullPath()
      .catch((error: Error) => {
        const errorMessage = 'Cannot resolve the coverage info file path in the build tree directory. ' +
          'Ensure that both ' +
          `'${Imports.Extension.Definitions.extensionNameInSettings}: Build Tree Directory' and ` +
          `'${Imports.Extension.Definitions.extensionNameInSettings}: Coverage Info File Name' ` +
          'settings are correctly set.';

        error.message.should.contain(errorMessage);
        errorChannelSpy.countFor('appendLine').should.be.equal(1);
      });
  });
}

function shouldFailWhenMoreThanOneFileAreFound() {
  it('should fail if the recursive search from the build tree directory does not find one file', () => {
    const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const errorChannelSpy = Imports.Fakes.Adapters.vscode.buildSpyOfErrorChannel(Imports.Fakes.Adapters.vscode.buildFakeErrorChannel());
    const errorChannel = errorChannelSpy.object;
    const settings = Imports.Domain.Implementations.SettingsProvider.make({ errorChannel, workspace }).settings;
    const globSearch = Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForNoMatch();
    const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();

    const resolver = Imports.Domain.Implementations.CoverageInfoFileResolver.make({ settings, globSearch, progressReporter, errorChannel });

    return resolver.resolveCoverageInfoFileFullPath()
      .catch((error: Error) => {
        const errorMessage = 'Cannot resolve the coverage info file path in the build tree directory. ' +
          'Ensure that both ' +
          `'${Imports.Extension.Definitions.extensionNameInSettings}: Build Tree Directory' and ` +
          `'${Imports.Extension.Definitions.extensionNameInSettings}: Coverage Info File Name' ` +
          'settings are correctly set.';

        error.message.should.contain(errorMessage);
        errorChannelSpy.countFor('appendLine').should.be.equal(1);
      });
  });
}

function shouldSucceedWhenExactlyOneFileIsFound() {
  it('should resolve correctly if the recursive search from the build tree directory find exactly one file in one discrete step.', async () => {
    const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const errorChannel = Imports.Fakes.Adapters.vscode.buildFakeErrorChannel();
    const settings = Imports.Domain.Implementations.SettingsProvider.make({ errorChannel, workspace }).settings;
    const globSearch = Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForExactlyOneMatch();
    const progressReporterSpy = Imports.Fakes.Adapters.vscode.buildSpyOfProgressReporter(Imports.Fakes.Adapters.vscode.buildFakeProgressReporter());
    const progressReporter = progressReporterSpy.object;

    const resolver = Imports.Domain.Implementations.CoverageInfoFileResolver.make({ settings, globSearch, progressReporter, errorChannel });

    await resolver.resolveCoverageInfoFileFullPath();

    progressReporterSpy.countFor('report').should.be.equal(1);
  });
}
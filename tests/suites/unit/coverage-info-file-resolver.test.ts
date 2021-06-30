import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as Definitions from '../../../src/extension/definitions';
import * as CoverageInfoFileResolver from '../../../src/modules/coverage-info-file-resolver/domain/coverage-info-file-resolver';
import * as SettingsProvider from '../../../src/modules/settings-provider/domain/settings-provider';

import * as vscode from '../../fakes/adapters/vscode';
import { globbing as g } from '../../fakes/adapters/globbing';
import { progressReporter as pr } from '../../fakes/adapters/progress-reporter';
import { errorChannel as e } from '../../fakes/adapters/error-channel';

describe('Unit test suite', () => {
  describe('the behavior of the coverage info file resolver', () => {
    describe('failing if the resolver does not find any file', shouldFailWhenNoFileIsFound);
    describe('failing if the resolver finds more than one file', shouldFailWhenMoreThanOneFileAreFound);
    describe('succeeding if the resolver finds exactly one file', shouldSucceedWhenExactlyOneFileIsFound);
  });
});

function shouldFailWhenNoFileIsFound() {
  it('should fail and report in error channel if the recursive search from the build tree directory does not find one file', () => {
    const workspace = vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const errorChannelSpy = e.buildSpyOfErrorChannel(e.buildFakeErrorChannel());
    const errorChannel = errorChannelSpy.object;
    const settings = SettingsProvider.make({ errorChannel, workspace }).settings;
    const globSearch = g.buildFakeGlobSearchForNoMatch();
    const progressReporter = pr.buildFakeProgressReporter();

    const resolver = CoverageInfoFileResolver.make({ settings, globSearch, progressReporter, errorChannel });

    return resolver.resolveCoverageInfoFileFullPath()
      .catch((error: Error) => {
        const errorMessage = 'Cannot resolve the coverage info file path in the build tree directory. ' +
          'Ensure that both ' +
          `'${Definitions.extensionNameInSettings}: Build Tree Directory' and ` +
          `'${Definitions.extensionNameInSettings}: Coverage Info File Name' ` +
          'settings are correctly set.';

        error.message.should.contain(errorMessage);
        errorChannelSpy.countFor('appendLine').should.be.equal(1);
      });
  });
}

function shouldFailWhenMoreThanOneFileAreFound() {
  it('should fail if the recursive search from the build tree directory does not find one file', () => {
    const workspace = vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const errorChannelSpy = e.buildSpyOfErrorChannel(e.buildFakeErrorChannel());
    const errorChannel = errorChannelSpy.object;
    const settings = SettingsProvider.make({ errorChannel, workspace }).settings;
    const globSearch = g.buildFakeGlobSearchForNoMatch();
    const progressReporter = pr.buildFakeProgressReporter();

    const resolver = CoverageInfoFileResolver.make({ settings, globSearch, progressReporter, errorChannel });

    return resolver.resolveCoverageInfoFileFullPath()
      .catch((error: Error) => {
        const errorMessage = 'Cannot resolve the coverage info file path in the build tree directory. ' +
          'Ensure that both ' +
          `'${Definitions.extensionNameInSettings}: Build Tree Directory' and ` +
          `'${Definitions.extensionNameInSettings}: Coverage Info File Name' ` +
          'settings are correctly set.';

        error.message.should.contain(errorMessage);
        errorChannelSpy.countFor('appendLine').should.be.equal(1);
      });
  });
}

function shouldSucceedWhenExactlyOneFileIsFound() {
  it('should resolve correctly if the recursive search from the build tree directory find exactly one file in one discrete step.', async () => {
    const workspace = vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const errorChannel = e.buildFakeErrorChannel();
    const settings = SettingsProvider.make({ errorChannel, workspace }).settings;
    const globSearch = g.buildFakeGlobSearchForExactlyOneMatch();
    const progressReporterSpy = pr.buildSpyOfProgressReporter(pr.buildFakeProgressReporter());
    const progressReporter = progressReporterSpy.object;

    const resolver = CoverageInfoFileResolver.make({ settings, globSearch, progressReporter, errorChannel });

    await resolver.resolveCoverageInfoFileFullPath();

    progressReporterSpy.countFor('report').should.be.equal(1);
  });
}
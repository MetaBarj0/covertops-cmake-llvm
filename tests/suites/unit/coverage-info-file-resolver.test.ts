import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as definitions from '../../../src/definitions';
import * as CoverageInfoFileResolver from '../../../src/domain/services/internal/coverage-info-file-resolver';

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
    const globSearch = g.buildFakeGlobSearchForNoMatch();
    const progressReporter = pr.buildFakeProgressReporter();
    const errorChannelSpy = e.buildSpyOfErrorChannel(e.buildFakeErrorChannel());
    const errorChannel = errorChannelSpy.object;

    const resolver = CoverageInfoFileResolver.make({ workspace, globSearch, progressReporter, errorChannel });

    return resolver.resolveCoverageInfoFileFullPath()
      .catch((error: Error) => {
        const errorMessage = 'Cannot resolve the coverage info file path in the build tree directory. ' +
          'Ensure that both ' +
          `'${definitions.extensionNameInSettings}: Build Tree Directory' and ` +
          `'${definitions.extensionNameInSettings}: Coverage Info File Name' ` +
          'settings are correctly set.';

        error.message.should.contain(errorMessage);
        errorChannelSpy.countFor('appendLine').should.be.equal(1);
      });
  });
}

function shouldFailWhenMoreThanOneFileAreFound() {
  it('should fail if the recursive search from the build tree directory does not find one file', () => {
    const workspace = vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const globSearch = g.buildFakeGlobSearchForNoMatch();
    const progressReporter = pr.buildFakeProgressReporter();
    const errorChannelSpy = e.buildSpyOfErrorChannel(e.buildFakeErrorChannel());
    const errorChannel = errorChannelSpy.object;

    const resolver = CoverageInfoFileResolver.make({ workspace, globSearch, progressReporter, errorChannel });

    return resolver.resolveCoverageInfoFileFullPath()
      .catch((error: Error) => {
        const errorMessage = 'Cannot resolve the coverage info file path in the build tree directory. ' +
          'Ensure that both ' +
          `'${definitions.extensionNameInSettings}: Build Tree Directory' and ` +
          `'${definitions.extensionNameInSettings}: Coverage Info File Name' ` +
          'settings are correctly set.';

        error.message.should.contain(errorMessage);
        errorChannelSpy.countFor('appendLine').should.be.equal(1);
      });
  });
}

function shouldSucceedWhenExactlyOneFileIsFound() {
  it('should resolve correctly if the recursive search from the build tree directory find exactly one file in one discrete step.', async () => {
    const workspace = vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const globSearch = g.buildFakeGlobSearchForExactlyOneMatch();
    const spy = pr.buildSpyOfProgressReporter(pr.buildFakeProgressReporter());
    const progressReporter = spy.object;
    const errorChannel = e.buildFakeErrorChannel();

    const resolver = CoverageInfoFileResolver.make({ workspace, globSearch, progressReporter, errorChannel });

    await resolver.resolveCoverageInfoFileFullPath();

    spy.countFor('report').should.be.equal(1);
  });
}
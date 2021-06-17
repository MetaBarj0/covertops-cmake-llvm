import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as definitions from '../../../src/definitions';
import * as CoverageInfoFileResolver from '../../../src/domain/services/internal/coverage-info-file-resolver';

import { vscodeWorkspace as v } from '../../faked-adapters/vscode-workspace';
import { globbing as g } from '../../faked-adapters/globbing';
import { progressReporter as pr } from '../../faked-adapters/progress-reporter';

describe('Unit test suite', () => {
  describe('the behavior of the coverage info file resolver', () => {
    describe('failing if the resolver does not find any file', shouldFailWhenNoFileIsFound);
    describe('failing if the resolver finds more than one file', shouldFailWhenMoreThanOneFileAreFound);
    describe('succeeding if the resolver finds exactly one file', shouldSucceedWhenExactlyOneFileIsFound);
  });
});

function shouldFailWhenNoFileIsFound() {
  it('should fail if the recursive search from the build tree directory does not find one file', () => {
    const workspace = v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const globSearch = g.buildFakeGlobSearchForNoMatch();
    const progressReporter = pr.buildFakeProgressReporter();

    const resolver = CoverageInfoFileResolver.make({ workspace, globSearch, progressReporter });

    return resolver.resolveCoverageInfoFileFullPath().should.eventually.be.rejectedWith(
      'Cannot resolve the coverage info file path in the build tree directory. ' +
      'Ensure that both ' +
      `'${definitions.extensionNameInSettings}: Build Tree Directory' and ` +
      `'${definitions.extensionNameInSettings}: Coverage Info File Name' ` +
      'settings are correctly set.');
  });
}

function shouldFailWhenMoreThanOneFileAreFound() {
  it('should fail if the recursive search from the build tree directory does not find one file', () => {
    const workspace = v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const globSearch = g.buildFakeGlobSearchForNoMatch();
    const progressReporter = pr.buildFakeProgressReporter();

    const resolver = CoverageInfoFileResolver.make({ workspace, globSearch, progressReporter });

    return resolver.resolveCoverageInfoFileFullPath().should.eventually.be.rejectedWith(
      'Cannot resolve the coverage info file path in the build tree directory. ' +
      'Ensure that both ' +
      `'${definitions.extensionNameInSettings}: Build Tree Directory' and ` +
      `'${definitions.extensionNameInSettings}: Coverage Info File Name' ` +
      'settings are correctly set.');
  });
}

function shouldSucceedWhenExactlyOneFileIsFound() {
  it('should resolve correctly if the recursive search from the build tree directory find exactly one file.', () => {
    const workspace = v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const globSearch = g.buildFakeGlobSearchForExactlyOneMatch();
    const progressReporter = pr.buildFakeProgressReporter();

    const resolver = CoverageInfoFileResolver.make({ workspace, globSearch, progressReporter });

    return resolver.resolveCoverageInfoFileFullPath().should.eventually.be.fulfilled;
  });
}
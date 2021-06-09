import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as definitions from '../../../src/definitions';
import * as CoverageInfoFileResolver from '../../../src/domain/services/internal/coverage-info-file-resolver';

import { vscodeWorkspace as v } from '../../faked-adapters/vscode-workspace';
import { globbing as g } from '../../faked-adapters/globbing';

describe('the behavior of the coverage info file resolving internal service', () => {
  it('should fail if the glob searched from the build tree directory does not find one file', () => {
    const workspace = v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const globSearch = g.buildFakeGlobSearchForNoMatch();

    const resolver = CoverageInfoFileResolver.make({ workspace, globSearch });

    return resolver.resolveCoverageInfoFileFullPath().should.eventually.be.rejectedWith(
      'Cannot resolve the coverage info file path in the build tree directory. ' +
      'Ensure that both ' +
      `'${definitions.extensionNameInSettings}: Build Tree Directory' and ` +
      `'${definitions.extensionNameInSettings}: Coverage Info File Name' ` +
      'settings are correctly set.');
  });

  it('should fail if the glob searched from the build tree directory finds more than one file', () => {
    const workspace = v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const globSearch = g.buildFakeGlobSearchForSeveralMatch();

    const resolver = CoverageInfoFileResolver.make({ workspace, globSearch });

    return resolver.resolveCoverageInfoFileFullPath().should.eventually.be.rejectedWith(
      'More than one coverage information file have been found in the build tree directory. ' +
      'Ensure that both ' +
      `'${definitions.extensionNameInSettings}: Build Tree Directory' and ` +
      `'${definitions.extensionNameInSettings}: Coverage Info File Name' ` +
      'settings are correctly set.');
  });

  it('should resolve correctly if the glob searched from the build tree directory find exactly one file.', () => {
    const workspace = v.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();
    const globSearch = g.buildFakeGlobSearchForExactlyOneMatch();

    const resolver = CoverageInfoFileResolver.make({ workspace, globSearch });

    return resolver.resolveCoverageInfoFileFullPath().should.eventually.be.fulfilled;
  });
});
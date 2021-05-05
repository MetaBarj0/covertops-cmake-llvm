import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import { CoverageInfoFileResolver } from '../../../src/domain/services/coverage-info-file-resolver';
import { glob, workspace } from '../../builders/fake-adapters';

import buildFakeWorkspace = workspace.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings;
import buildFakeGlobSearchForNoMatch = glob.buildFakeGlobSearchForNoMatch;
import buildFakeGlobSearchForSeveralMatch = glob.buildFakeGlobSearchForSeveralMatch;
import buildFakeGlobSearchForExactlyOneMatch = glob.buildFakeGlobSearchForExactlyOneMatch;
import { extensionName } from '../../../src/extension-name';

describe('the behavior of the coverage info file resolving internal service', () => {
  it('should fail if the glob searched from the build tree directory does not find one file', () => {
    const workspace = buildFakeWorkspace();
    const globSearch = buildFakeGlobSearchForNoMatch();

    const resolver = new CoverageInfoFileResolver(workspace, globSearch);

    return resolver.resolveCoverageInfoFileFullPath().should.eventually.be.rejectedWith(
      'Cannot resolve the coverage info file path in the build tree directory. ' +
      'Ensure that both ' +
      `'${extensionName}: Build Tree Directory' and '${extensionName}: Coverage Info File Name' ` +
      'settings are correctly set.');
  });

  it('should fail if the glob searched from the build tree directory finds more than one file', () => {
    const workspace = buildFakeWorkspace();
    const globSearch = buildFakeGlobSearchForSeveralMatch();

    const resolver = new CoverageInfoFileResolver(workspace, globSearch);

    return resolver.resolveCoverageInfoFileFullPath().should.eventually.be.rejectedWith(
      'More than one coverage information file have been found. ' +
      'Ensure that both ' +
      `'${extensionName}: Build Tree Directory' and '${extensionName}: Coverage Info File Name' ` +
      'settings are correctly set.');
  });

  it('should resolve correctly if the glob searched from the build tree directory find exactly one file.', () => {
    const workspace = buildFakeWorkspace();
    const globSearch = buildFakeGlobSearchForExactlyOneMatch();

    const resolver = new CoverageInfoFileResolver(workspace, globSearch);

    return resolver.resolveCoverageInfoFileFullPath().should.eventually.be.fulfilled;
  });
});
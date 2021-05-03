import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import { CoverageInfoFileResolver } from '../../../src/domain/services/coverage-info-file-resolver';
import { glob, workspace } from '../../builders/fake-adapters';

import buildFakeWorkspace = workspace.buildFakedVscodeWorkspaceWithWorkspaceFolderAndWithOverridableDefaultSettings;
import buildFakeGlobSearch = glob.buildFakeGlobSearch;

describe('the behavior of the coverage info file resolving internal service', () => {
  it('should fail if the glob searched from the build tree directory does not find one file', () => {
    const workspace = buildFakeWorkspace();
    const globSearch = buildFakeGlobSearch();

    const resolver = new CoverageInfoFileResolver(workspace, globSearch);

    return resolver.resolveCoverageInfoFileFullPath().should.eventually.be.rejectedWith(
      'Cannot resolve the coverage info file path in the build tree directory. ' +
      'Ensure that both ' +
      "'cmake-llvm-coverage: Build Tree Directory' and 'cmake-llvm-coverage: Coverage Info File Name' " +
      'settings are correctly set.');
  });

  it('should fail if the glob searched from the build tree directory finds more than one file', () => {
    (() => { }).should.throw('test is not implemented');
  });

  it('should resolve correctly if the glob searched from the build tree directory find exactly one file.', () => {
    (() => { }).should.throw('test is not implemented');
  });
});
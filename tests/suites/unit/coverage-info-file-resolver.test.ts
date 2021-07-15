import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as Imports from './imports';
import { Spy } from '../../utils/spy';

describe('Unit test suite', () => {
  describe('the behavior of the coverage info file resolver', () => {
    describe('failing if the resolver does not find any file', shouldFailWhenNoFileIsFound);
    describe('failing if the resolver finds more than one file', shouldFailWhenMoreThanOneFileAreFound);
    describe('succeeding if the resolver finds exactly one file', shouldSucceedWhenExactlyOneFileIsFound);
  });
});

function shouldFailWhenNoFileIsFound() {
  it('should fail and report in error channel if the recursive search from the build tree directory does not find one file', () => {
    const errorChannelSpy = Imports.Fakes.Adapters.vscode.buildSpyOfErrorChannel(Imports.Fakes.Adapters.vscode.buildFakeErrorChannel());
    const globSearch = Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForNoMatch();
    const resolver = buildCoverageInfoFileResolver({ errorChannelSpy, globSearch });

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
  it('should fail if the recursive search from the build tree directory finds more than one file', () => {
    const errorChannelSpy = Imports.Fakes.Adapters.vscode.buildSpyOfErrorChannel(Imports.Fakes.Adapters.vscode.buildFakeErrorChannel());
    const globSearch = Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForSeveralMatch();

    const resolver = buildCoverageInfoFileResolver({ errorChannelSpy, globSearch });

    return resolver.resolveCoverageInfoFileFullPath()
      .catch((error: Error) => {
        const errorMessage = 'More than one coverage information file have been found in the build tree directory. ' +
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
    const progressReporterSpy = Imports.Fakes.Adapters.vscode.buildSpyOfProgressReporter(Imports.Fakes.Adapters.vscode.buildFakeProgressReporter());
    const globSearch = Imports.Fakes.Adapters.FileSystem.buildFakeGlobSearchForExactlyOneMatch();
    const resolver = buildCoverageInfoFileResolver({ progressReporterSpy, globSearch });

    await resolver.resolveCoverageInfoFileFullPath();

    progressReporterSpy.countFor('report').should.be.equal(1);
  });
}


function buildAdapters(optionalSpiesAndAdapters: OptionalSpiesAndAdapters) {
  const errorChannel = optionalSpiesAndAdapters.errorChannelSpy ? optionalSpiesAndAdapters.errorChannelSpy.object : Imports.Fakes.Adapters.vscode.buildFakeErrorChannel();
  const progressReporter = optionalSpiesAndAdapters.progressReporterSpy ? optionalSpiesAndAdapters.progressReporterSpy.object : Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();
  const workspace = Imports.Fakes.Adapters.vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings();

  return {
    workspace,
    errorChannel,
    globSearch: optionalSpiesAndAdapters.globSearch,
    progressReporter
  };
}

function buildCoverageInfoFileResolver(optionalSpiesAndAdapters: OptionalSpiesAndAdapters) {
  const adapters = buildAdapters(optionalSpiesAndAdapters);

  const settings = Imports.Domain.Implementations.SettingsProvider.make({ ...adapters }).settings;

  return Imports.Domain.Implementations.CoverageInfoFileResolver.make({ ...adapters, settings });
}

type OptionalSpiesAndAdapters = {
  errorChannelSpy?: Spy<Imports.Adapters.Abstractions.vscode.OutputChannelLike>
  progressReporterSpy?: Spy<Imports.Adapters.Abstractions.vscode.ProgressLike>,
  globSearch: Imports.Adapters.Abstractions.FileSystem.GlobSearchCallable
};
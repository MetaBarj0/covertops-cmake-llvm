import * as chai from 'chai';
import { describe, it, before, after } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as Imports from './imports';

import { env } from 'process';
import * as path from 'path';

// TODO: refacto this like modules.workspace.tests.ts
describe('integration test suite', () => {
  describe('The behavior of the coverage info provider using real world adapters', () => {
    describe('The coverage information collection for a partially covered file', () => {
      describe('Collecting summary coverage information should succeed', collectSummaryCoverageInfoFromPartiallyCoveredFileShouldSucceed);
      describe('Collecting uncovered region coverage information should succeed', collectUncoveredRegionsCoverageInfoFromPartiallyCoveredFileShouldSucced);
    });
    describe('The coverage information collection for a fully covered file', () => {
      describe('Collecting summary coverage information should succeed', collectSummaryCoverageInfoFromFullyCoveredFileShouldSucceed);
      describe('Collecting uncovered region coverage information should succeed', collectUncoveredRegionsCoverageInfoFromFullyCoveredFileShouldSucced);
    });
  });
});

function collectUncoveredRegionsCoverageInfoFromPartiallyCoveredFileShouldSucced() {
  let originalEnvPath: string;

  before('Modifying additional cmake command options, PATH environment variable ', async () => {
    await extensionConfiguration.update('additionalCmakeOptions', ['-DCMAKE_CXX_COMPILER=clang++', '-G', 'Ninja']);

    originalEnvPath = prependLlvmBinDirToPathEnvironmentVariable();
  });

  it('should report correct coverage information for a specific cpp file', async () => {
    const errorChannel = Imports.Fakes.Adapters.vscode.buildFakeErrorChannel();
    const settings = Imports.Domain.Implementations.SettingsProvider.make({ workspace: Imports.Adapters.vscode.workspace, errorChannel }).settings;
    const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();
    const mkdir = Imports.Adapters.FileSystem.mkdir;
    const stat = Imports.Adapters.FileSystem.stat;
    const buildTreeDirectoryResolver = Imports.Domain.Implementations.BuildTreeDirectoryResolver.make({ errorChannel, settings, mkdir, stat, progressReporter });
    const execFile = Imports.Adapters.ProcessControl.execFile;
    const cmake = Imports.Domain.Implementations.Cmake.make({
      settings,
      execFile,
      errorChannel,
      progressReporter
    });
    const createReadStream = Imports.Adapters.FileSystem.createReadStream;
    const globSearch = Imports.Adapters.FileSystem.globSearch;
    const coverageInfoFileResolver = Imports.Domain.Implementations.CoverageInfoFileResolver.make({
      errorChannel,
      globSearch,
      progressReporter,
      settings
    });
    const coverageInfoCollector = Imports.Domain.Implementations.CoverageInfoCollector.make({
      coverageInfoFileResolver,
      createReadStream,
      errorChannel,
      progressReporter,
    });

    const provider = Imports.Domain.Implementations.CoverageInfoProvider.make({
      settings,
      buildTreeDirectoryResolver,
      cmake,
      coverageInfoCollector
    });

    const sourceFilePath = createAbsoluteSourceFilePathFrom('partiallyCovered/partiallyCoveredLib.cpp');

    const coverageInfo = await provider.getCoverageInfoForFile(sourceFilePath);

    const uncoveredRegions: Array<Imports.Domain.Abstractions.RegionCoverageInfo> = [];
    for await (const region of coverageInfo.uncoveredRegions)
      uncoveredRegions.push(region);

    uncoveredRegions.length.should.be.equal(1);
    uncoveredRegions[0].range.should.be.deep.equal({
      start: {
        line: 5,
        character: 52
      },
      end: {
        line: 5,
        character: 70
      }
    });
  });

  after('restoring additional cmake command options and PATH environment variable', async () => {
    await extensionConfiguration.update('additionalCmakeOptions', []);

    env['PATH'] = originalEnvPath;
  });
}

function collectSummaryCoverageInfoFromPartiallyCoveredFileShouldSucceed() {
  let originalEnvPath: string;

  before('Modifying additional cmake command options, PATH environment variable ', async () => {
    await extensionConfiguration.update('additionalCmakeOptions', ['-DCMAKE_CXX_COMPILER=clang++', '-G', 'Ninja']);

    originalEnvPath = prependLlvmBinDirToPathEnvironmentVariable();
  });

  it('should report correct coverage information for a specific cpp file', async () => {
    const errorChannel = Imports.Fakes.Adapters.vscode.buildFakeErrorChannel();
    const settings = Imports.Domain.Implementations.SettingsProvider.make({ workspace: Imports.Adapters.vscode.workspace, errorChannel }).settings;
    const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();
    const mkdir = Imports.Adapters.FileSystem.mkdir;
    const stat = Imports.Adapters.FileSystem.stat;
    const buildTreeDirectoryResolver = Imports.Domain.Implementations.BuildTreeDirectoryResolver.make({ errorChannel, settings, mkdir, stat, progressReporter });
    const execFile = Imports.Adapters.ProcessControl.execFile;
    const cmake = Imports.Domain.Implementations.Cmake.make({
      settings,
      execFile,
      errorChannel,
      progressReporter
    });
    const createReadStream = Imports.Adapters.FileSystem.createReadStream;
    const globSearch = Imports.Adapters.FileSystem.globSearch;
    const coverageInfoFileResolver = Imports.Domain.Implementations.CoverageInfoFileResolver.make({
      errorChannel,
      globSearch,
      progressReporter,
      settings
    });
    const coverageInfoCollector = Imports.Domain.Implementations.CoverageInfoCollector.make({
      coverageInfoFileResolver,
      createReadStream,
      errorChannel,
      progressReporter,
    });

    const provider = Imports.Domain.Implementations.CoverageInfoProvider.make({
      settings,
      buildTreeDirectoryResolver,
      cmake,
      coverageInfoCollector
    });

    const sourceFilePath = createAbsoluteSourceFilePathFrom('partiallyCovered/partiallyCoveredLib.cpp');

    const coverageInfo = await provider.getCoverageInfoForFile(sourceFilePath);

    const summary = await coverageInfo.summary;

    summary.should.be.deep.equal({
      count: 2,
      covered: 1,
      notCovered: 1,
      percent: 50
    });
  });

  after('restoring additional cmake command options and PATH environment variable', async () => {
    await extensionConfiguration.update('additionalCmakeOptions', []);

    env['PATH'] = originalEnvPath;
  });
}

function collectSummaryCoverageInfoFromFullyCoveredFileShouldSucceed() {
  let originalEnvPath: string;

  before('Modifying additional cmake command options, PATH environment variable ', async () => {
    await extensionConfiguration.update('additionalCmakeOptions', ['-DCMAKE_CXX_COMPILER=clang++', '-G', 'Ninja']);

    originalEnvPath = prependLlvmBinDirToPathEnvironmentVariable();
  });

  it('should report correct coverage information for a specific file', async () => {
    const errorChannel = Imports.Fakes.Adapters.vscode.buildFakeErrorChannel();
    const settings = Imports.Domain.Implementations.SettingsProvider.make({ workspace: Imports.Adapters.vscode.workspace, errorChannel }).settings;
    const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();
    const mkdir = Imports.Adapters.FileSystem.mkdir;
    const stat = Imports.Adapters.FileSystem.stat;
    const buildTreeDirectoryResolver = Imports.Domain.Implementations.BuildTreeDirectoryResolver.make({ errorChannel, settings, mkdir, stat, progressReporter });
    const execFile = Imports.Adapters.ProcessControl.execFile;
    const cmake = Imports.Domain.Implementations.Cmake.make({
      settings,
      execFile,
      errorChannel,
      progressReporter
    });
    const createReadStream = Imports.Adapters.FileSystem.createReadStream;
    const globSearch = Imports.Adapters.FileSystem.globSearch;
    const coverageInfoFileResolver = Imports.Domain.Implementations.CoverageInfoFileResolver.make({
      errorChannel,
      globSearch,
      progressReporter,
      settings
    });
    const coverageInfoCollector = Imports.Domain.Implementations.CoverageInfoCollector.make({
      coverageInfoFileResolver,
      createReadStream,
      errorChannel,
      progressReporter
    });

    const provider = Imports.Domain.Implementations.CoverageInfoProvider.make({
      settings,
      buildTreeDirectoryResolver,
      cmake,
      coverageInfoCollector
    });

    const sourceFilePath = createAbsoluteSourceFilePathFrom('fullyCovered/fullyCoveredLib.cpp');

    const coverageInfo = await provider.getCoverageInfoForFile(sourceFilePath);

    const summary = await coverageInfo.summary;

    summary.should.be.deep.equal({
      count: 2,
      covered: 2,
      notCovered: 0,
      percent: 100
    });
  });

  after('restoring additional cmake command options and PATH environment variable', async () => {
    await extensionConfiguration.update('additionalCmakeOptions', []);

    env['PATH'] = originalEnvPath;
  });
}

function collectUncoveredRegionsCoverageInfoFromFullyCoveredFileShouldSucced() {
  let originalEnvPath: string;

  before('Modifying additional cmake command options, PATH environment variable ', async () => {
    await extensionConfiguration.update('additionalCmakeOptions', ['-DCMAKE_CXX_COMPILER=clang++', '-G', 'Ninja']);

    originalEnvPath = prependLlvmBinDirToPathEnvironmentVariable();
  });

  it('should report correct coverage information for a specific file', async () => {
    const errorChannel = Imports.Fakes.Adapters.vscode.buildFakeErrorChannel();
    const settings = Imports.Domain.Implementations.SettingsProvider.make({ workspace: Imports.Adapters.vscode.workspace, errorChannel }).settings;
    const progressReporter = Imports.Fakes.Adapters.vscode.buildFakeProgressReporter();
    const mkdir = Imports.Adapters.FileSystem.mkdir;
    const stat = Imports.Adapters.FileSystem.stat;
    const buildTreeDirectoryResolver = Imports.Domain.Implementations.BuildTreeDirectoryResolver.make({ errorChannel, settings, mkdir, stat, progressReporter });
    const execFile = Imports.Adapters.ProcessControl.execFile;
    const globSearch = Imports.Adapters.FileSystem.globSearch;
    const cmake = Imports.Domain.Implementations.Cmake.make({
      settings,
      execFile,
      errorChannel,
      progressReporter
    });
    const coverageInfoFileResolver = Imports.Domain.Implementations.CoverageInfoFileResolver.make({
      errorChannel,
      progressReporter,
      settings,
      globSearch
    });
    const createReadStream = Imports.Adapters.FileSystem.createReadStream;
    const coverageInfoCollector = Imports.Domain.Implementations.CoverageInfoCollector.make({
      coverageInfoFileResolver,
      createReadStream,
      errorChannel,
      progressReporter
    });

    const provider = Imports.Domain.Implementations.CoverageInfoProvider.make({
      settings,
      buildTreeDirectoryResolver,
      cmake,
      coverageInfoCollector
    });

    const sourceFilePath = createAbsoluteSourceFilePathFrom('fullyCovered/fullyCoveredLib.cpp');

    const coverageInfo = await provider.getCoverageInfoForFile(sourceFilePath);

    const uncoveredRegions: Array<Imports.Domain.Abstractions.RegionCoverageInfo> = [];
    for await (const region of coverageInfo.uncoveredRegions)
      uncoveredRegions.push(region);

    uncoveredRegions.length.should.be.equal(0);
  });

  after('restoring additional cmake command options and PATH environment variable', async () => {
    await extensionConfiguration.update('additionalCmakeOptions', []);

    env['PATH'] = originalEnvPath;
  });
}

function createAbsoluteSourceFilePathFrom(workspacePath: string) {
  const relative = path.join('..', '..', '..', 'workspace', 'src', workspacePath);
  const absolute = path.resolve(__dirname, relative);
  return path.normalize(absolute);
}

function prependLlvmBinDirToPathEnvironmentVariable() {
  const oldPath = <string>env['PATH'];

  if (env['LLVM_DIR']) {
    const binDir = path.join(env['LLVM_DIR'], 'bin');
    const currentPath = <string>env['PATH'];
    env['PATH'] = `${binDir}${path.delimiter}${currentPath}`;
  }

  return oldPath;
}

const extensionConfiguration = Imports.Adapters.vscode.workspace.getConfiguration(Imports.Extension.Definitions.extensionId);
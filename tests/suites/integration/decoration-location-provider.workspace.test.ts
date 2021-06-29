import * as chai from 'chai';
import { describe, it, before, after } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import { RegionCoverageInfo } from '../../../src/domain/value-objects/region-coverage-info';
import * as definitions from '../../../src/definitions';

import * as DecorationLocationsProvider from '../../../src/domain/services/decoration-locations-provider';
import * as SettingsProvider from '../../../src/domain/services/internal/settings-provider';

import { progressReporter as pr } from '../../fakes/adapters/progress-reporter';
import { errorChannel as e } from '../../fakes/adapters/error-channel';

import * as pc from '../../../src/adapters/process-control';
import * as fs from '../../../src/adapters/file-system';
import * as vscode from '../../../src/adapters/vscode';

import { env } from 'process';
import * as path from 'path';

describe('integration test suite', () => {
  describe('The behavior of the decoration location provider using real world adapters', () => {
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
    const errorChannel = e.buildFakeErrorChannel();
    const settings = SettingsProvider.make({ workspace: vscode.workspace, errorChannel }).settings;

    const provider = DecorationLocationsProvider.make({
      settings,
      vscode: {
        progressReporter: pr.buildFakeProgressReporter(),
        errorChannel,
        workspace: vscode.workspace
      },
      processControl: {
        execFileForCommand: pc.execFile,
        execFileForTarget: pc.execFile
      },
      fileSystem: {
        createReadStream: fs.createReadStream,
        globSearch: fs.globSearch,
        mkdir: fs.mkdir,
        stat: fs.stat
      }
    });

    const sourceFilePath = createAbsoluteSourceFilePathFrom('partiallyCovered/partiallyCoveredLib.cpp');

    const decorations = await provider.getDecorationLocationsForUncoveredCodeRegions(sourceFilePath);

    const uncoveredRegions: Array<RegionCoverageInfo> = [];
    for await (const region of decorations.uncoveredRegions)
      uncoveredRegions.push(region);

    uncoveredRegions.length.should.be.equal(1);
    uncoveredRegions[0].range.should.be.deep.equal({
      start: {
        line: 6,
        character: 53
      },
      end: {
        line: 6,
        character: 71
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
    const errorChannel = e.buildFakeErrorChannel();
    const settings = SettingsProvider.make({ workspace: vscode.workspace, errorChannel }).settings;

    const provider = DecorationLocationsProvider.make({
      settings,
      vscode: {
        progressReporter: pr.buildFakeProgressReporter(),
        errorChannel,
        workspace: vscode.workspace
      },
      processControl: {
        execFileForCommand: pc.execFile,
        execFileForTarget: pc.execFile
      },
      fileSystem: {
        createReadStream: fs.createReadStream,
        globSearch: fs.globSearch,
        mkdir: fs.mkdir,
        stat: fs.stat
      }
    });

    const sourceFilePath = createAbsoluteSourceFilePathFrom('partiallyCovered/partiallyCoveredLib.cpp');

    const decorations = await provider.getDecorationLocationsForUncoveredCodeRegions(sourceFilePath);

    const summary = await decorations.summary;

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
    const errorChannel = e.buildFakeErrorChannel();
    const settings = SettingsProvider.make({ workspace: vscode.workspace, errorChannel }).settings;

    const provider = DecorationLocationsProvider.make({
      settings,
      vscode: {
        progressReporter: pr.buildFakeProgressReporter(),
        errorChannel,
        workspace: vscode.workspace
      },
      processControl: {
        execFileForCommand: pc.execFile,
        execFileForTarget: pc.execFile
      },
      fileSystem: {
        createReadStream: fs.createReadStream,
        globSearch: fs.globSearch,
        mkdir: fs.mkdir,
        stat: fs.stat
      }
    });

    const sourceFilePath = createAbsoluteSourceFilePathFrom('fullyCovered/fullyCoveredLib.cpp');

    const decorations = await provider.getDecorationLocationsForUncoveredCodeRegions(sourceFilePath);

    const summary = await decorations.summary;

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
    const errorChannel = e.buildFakeErrorChannel();
    const settings = SettingsProvider.make({ workspace: vscode.workspace, errorChannel }).settings;

    const provider = DecorationLocationsProvider.make({
      settings,
      vscode: {
        progressReporter: pr.buildFakeProgressReporter(),
        errorChannel,
        workspace: vscode.workspace
      },
      processControl: {
        execFileForCommand: pc.execFile,
        execFileForTarget: pc.execFile
      },
      fileSystem: {
        createReadStream: fs.createReadStream,
        globSearch: fs.globSearch,
        mkdir: fs.mkdir,
        stat: fs.stat
      }
    });

    const sourceFilePath = createAbsoluteSourceFilePathFrom('fullyCovered/fullyCoveredLib.cpp');

    const decorations = await provider.getDecorationLocationsForUncoveredCodeRegions(sourceFilePath);

    const uncoveredRegions: Array<RegionCoverageInfo> = [];
    for await (const region of decorations.uncoveredRegions)
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
  const sourceFilePath = path.normalize(absolute);

  return `${sourceFilePath[0].toUpperCase()}${sourceFilePath.slice(1)}`;
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

const extensionConfiguration = vscode.workspace.getConfiguration(definitions.extensionId);
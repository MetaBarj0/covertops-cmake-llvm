import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as definitions from '../../../src/definitions';
import * as DecorationLocationsProvider from '../../../src/domain/services/decoration-locations-provider';
import { RegionCoverageInfo } from '../../../src/domain/value-objects/region-coverage-info';

import { mkDir } from '../../fakes/adapters/mk-dir';
import * as vscode from '../../fakes/adapters/vscode';
import { process as p } from '../../fakes/adapters/process';
import { inputStream as i } from '../../fakes/adapters/input-stream';
import { statFile as sf } from '../../fakes/adapters/stat-file';
import { globbing as g } from '../../fakes/adapters/globbing';
import { progressReporter as pr } from '../../fakes/adapters/progress-reporter';
import { errorChannel as e } from '../../fakes/adapters/error-channel';

describe('acceptance suite of tests', () => {
  describe('The decoration location provider service behavior', () => {
    describe('The service being instantiated with faked adapters', instantiateService);
    describe('The service failing with incorrect settings', () => {
      describe('When issues arise with the build tree directory', failBecauseOfIssuesWithBuildTreeDirectorySetting);
      describe('When issues arise with the cmake command', failBecauseOfIssuesWithCmakeCommandSetting);
      describe('When issues arise with the cmake target', failBecauseOfIssuesWithCmakeTargetSetting);
      describe('When issues arise with the coverage info file name', () => {
        describe('When the coverage info file is not found', failBecauseCoverageInfoFileIsNotFound);
        describe('When several coverage info file are found', failBecauseSeveralCoverageInfoFileAreFound);
      });
    });
    describe('The service succeding with correct settings and fake adapters', succeedWithCorrectSettingsAndFakeAdapters);
  });
});

function instantiateService() {
  it('should not throw when instantiated with faked adapters.', () => {
    const instantiation = () => {
      DecorationLocationsProvider.make({
        fileSystem: {
          stat: sf.buildFakeFailingStatFile(),
          globSearch: g.buildFakeGlobSearchForNoMatch(),
          mkdir: mkDir.buildFakeFailingMkDir(),
          createReadStream: i.buildFakeStreamBuilder(i.buildEmptyReadableStream),
        },
        processControl: {
          execFileForCommand: p.buildFakeFailingProcess(),
          execFileForTarget: p.buildFakeFailingProcess(),
        },
        vscode: {
          workspace: vscode.buildFakeWorkspaceWithoutWorkspaceFolderAndWithoutSettings(),
          progressReporter: pr.buildFakeProgressReporter(),
          errorChannel: e.buildFakeErrorChannel()
        }
      });
    };

    instantiation.should.not.throw();
  });
}

function failBecauseOfIssuesWithBuildTreeDirectorySetting() {
  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the build tree directory can not be found and / or created', () => {
      const provider = DecorationLocationsProvider.make({
        fileSystem: {
          stat: sf.buildFakeFailingStatFile(),
          globSearch: g.buildFakeGlobSearchForNoMatch(),
          mkdir: mkDir.buildFakeFailingMkDir(),
          createReadStream: i.buildFakeStreamBuilder(i.buildEmptyReadableStream),
        },
        processControl: {
          execFileForCommand: p.buildFakeFailingProcess(),
          execFileForTarget: p.buildFakeFailingProcess(),
        },
        vscode: {
          workspace: vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
          progressReporter: pr.buildFakeProgressReporter(),
          errorChannel: e.buildFakeErrorChannel()
        }
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        'Cannot find or create the build tree directory. Ensure the ' +
        `'${definitions.extensionNameInSettings}: Build Tree Directory' setting is a valid relative path.`);
    });
}

function failBecauseOfIssuesWithCmakeCommandSetting() {
  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake command cannot be reached.', () => {
      const provider = DecorationLocationsProvider.make({
        fileSystem: {
          stat: sf.buildFakeSucceedingStatFile(),
          globSearch: g.buildFakeGlobSearchForNoMatch(),
          mkdir: mkDir.buildFakeFailingMkDir(),
          createReadStream: i.buildFakeStreamBuilder(i.buildEmptyReadableStream),
        },
        processControl: {
          execFileForCommand: p.buildFakeFailingProcess(),
          execFileForTarget: p.buildFakeFailingProcess(),
        },
        vscode: {
          workspace: vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ cmakeCommand: '' }),
          progressReporter: pr.buildFakeProgressReporter(),
          errorChannel: e.buildFakeErrorChannel()
        }
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        `Cannot find the cmake command. Ensure the '${definitions.extensionNameInSettings}: Cmake Command' ` +
        'setting is correctly set. Have you verified your PATH environment variable?');
    });
}

function failBecauseOfIssuesWithCmakeTargetSetting() {
  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake target cannot be built', () => {
      const workspace = vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ cmakeTarget: '' });
      const target = workspace.getConfiguration('cmake-llvm-workspace').get('cmakeTarget');

      const provider = DecorationLocationsProvider.make({
        fileSystem: {
          stat: sf.buildFakeSucceedingStatFile(),
          globSearch: g.buildFakeGlobSearchForNoMatch(),
          mkdir: mkDir.buildFakeFailingMkDir(),
          createReadStream: i.buildFakeStreamBuilder(i.buildEmptyReadableStream),
        },
        processControl: {
          execFileForCommand: p.buildFakeSucceedingProcess(),
          execFileForTarget: p.buildFakeFailingProcess(),
        },
        vscode: {
          workspace,
          progressReporter: pr.buildFakeProgressReporter(),
          errorChannel: e.buildFakeErrorChannel()
        }
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        `Error: Could not build the specified cmake target ${target}. ` +
        `Ensure '${definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`);
    });
}

function failBecauseCoverageInfoFileIsNotFound() {
  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the coverage info file name cannot be found', () => {
      const provider = DecorationLocationsProvider.make({
        fileSystem: {
          stat: sf.buildFakeSucceedingStatFile(),
          globSearch: g.buildFakeGlobSearchForNoMatch(),
          mkdir: mkDir.buildFakeFailingMkDir(),
          createReadStream: i.buildFakeStreamBuilder(i.buildEmptyReadableStream),
        },
        processControl: {
          execFileForCommand: p.buildFakeSucceedingProcess(),
          execFileForTarget: p.buildFakeSucceedingProcess(),
        },
        vscode: {
          workspace: vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ coverageInfoFileName: 'baadf00d' }),
          progressReporter: pr.buildFakeProgressReporter(),
          errorChannel: e.buildFakeErrorChannel()
        }
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        'Cannot resolve the coverage info file path in the build tree directory. ' +
        'Ensure that both ' +
        `'${definitions.extensionNameInSettings}: Build Tree Directory' and ` +
        `'${definitions.extensionNameInSettings}: Coverage Info File Name' ` +
        'settings are correctly set.');
    });
}

function failBecauseSeveralCoverageInfoFileAreFound() {
  it('should not not able to provide any decoration for uncovered code regions ' +
    'when there are more than one generated coverage information file that are found', () => {
      const provider = DecorationLocationsProvider.make({
        fileSystem: {
          stat: sf.buildFakeSucceedingStatFile(),
          globSearch: g.buildFakeGlobSearchForSeveralMatch(),
          mkdir: mkDir.buildFakeFailingMkDir(),
          createReadStream: i.buildFakeStreamBuilder(i.buildEmptyReadableStream),
        },
        processControl: {
          execFileForCommand: p.buildFakeSucceedingProcess(),
          execFileForTarget: p.buildFakeSucceedingProcess(),
        },
        vscode: {
          workspace: vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
          progressReporter: pr.buildFakeProgressReporter(),
          errorChannel: e.buildFakeErrorChannel()
        }
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        'More than one coverage information file have been found in the build tree directory. ' +
        'Ensure that both ' +
        `'${definitions.extensionNameInSettings}: Build Tree Directory' and ` +
        `'${definitions.extensionNameInSettings}: Coverage Info File Name' ` +
        'settings are correctly set.');
    });
}

function succeedWithCorrectSettingsAndFakeAdapters() {
  it('should succed to collect correct coverage information for the requested file in x discrete steps.', async () => {
    const progressReporterSpy = pr.buildSpyOfProgressReporter(pr.buildFakeProgressReporter());

    const provider = DecorationLocationsProvider.make({
      fileSystem: {
        stat: sf.buildFakeSucceedingStatFile(),
        globSearch: g.buildFakeGlobSearchForExactlyOneMatch(),
        mkdir: mkDir.buildFakeSucceedingMkDir(),
        createReadStream: i.buildFakeStreamBuilder(i.buildValidLlvmCoverageJsonObjectStream),
      },
      processControl: {
        execFileForCommand: p.buildFakeSucceedingProcess(),
        execFileForTarget: p.buildFakeSucceedingProcess(),
      },
      vscode: {
        workspace: vscode.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
        progressReporter: progressReporterSpy.object,
        errorChannel: e.buildFakeErrorChannel()
      }
    });

    const decorations = await provider.getDecorationLocationsForUncoveredCodeRegions('/a/source/file.cpp');

    const uncoveredRegions: Array<RegionCoverageInfo> = [];
    for await (const region of decorations.uncoveredRegions)
      uncoveredRegions.push(region);

    const summary = await decorations.summary;

    summary.should.be.deep.equal({
      count: 2,
      covered: 2,
      notCovered: 0,
      percent: 100
    });

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

    progressReporterSpy.countFor('report').should.be.equal(6);
  });
}
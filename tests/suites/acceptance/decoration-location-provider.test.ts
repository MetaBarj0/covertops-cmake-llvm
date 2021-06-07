import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as definitions from '../../../src/definitions';
import { DecorationLocationsProvider } from '../../../src/domain/services/decoration-locations-provider';

import {
  process as p,
  statFile as sf,
  workspace as w,
  glob as g,
  fs,
  stream as s
} from '../../builders/fake-adapters';

describe('DecorationLocationProvider service behavior.', () => {
  it('should be correctly instantiated with faked adapters.', () => {
    const instantiation = () => {
      new DecorationLocationsProvider({
        workspace: w.buildFakeWorkspaceWithoutWorkspaceFolderAndWithoutSettings(),
        statFile: sf.buildFakeFailingStatFile(),
        processForCmakeCommand: p.buildFakeFailingProcess(),
        processForCmakeTarget: p.buildFakeFailingProcess(),
        globSearch: g.buildFakeGlobSearchForNoMatch(),
        fs: fs.buildFakeFailingFs(),
        llvmCoverageInfoStreamBuilder: s.buildFakeStreamBuilder(s.buildEmptyReadableStream),
      });
    };

    instantiation.should.not.throw();
  });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the build tree directory can not be found and / or created though cmake command ' +
    'is invocable', () => {
      const provider = new DecorationLocationsProvider({
        workspace: w.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
        statFile: sf.buildFakeFailingStatFile(),
        processForCmakeCommand: p.buildFakeFailingProcess(),
        processForCmakeTarget: p.buildFakeFailingProcess(),
        globSearch: g.buildFakeGlobSearchForNoMatch(),
        fs: fs.buildFakeFailingFs(),
        llvmCoverageInfoStreamBuilder: s.buildFakeStreamBuilder(s.buildEmptyReadableStream),
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        'Cannot find or create the build tree directory. Ensure the ' +
        `'${definitions.extensionNameInSettings}: Build Tree Directory' setting is a valid relative path.`);
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake command cannot be reached.',
    () => {
      const provider = new DecorationLocationsProvider({
        workspace: w.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ cmakeCommand: '' }),
        statFile: sf.buildFakeSucceedingStatFile(),
        processForCmakeCommand: p.buildFakeFailingProcess(),
        processForCmakeTarget: p.buildFakeFailingProcess(),
        globSearch: g.buildFakeGlobSearchForNoMatch(),
        fs: fs.buildFakeFailingFs(),
        llvmCoverageInfoStreamBuilder: s.buildFakeStreamBuilder(s.buildEmptyReadableStream),
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        `Cannot find the cmake command. Ensure the '${definitions.extensionNameInSettings}: Cmake Command' ` +
        'setting is correctly set. Have you verified your PATH environment variable?');
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the cmake target cannot be built by cmake though the cmake command is invocable and ' +
    'the build tree directory exists.',
    () => {
      const workspace = w.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ cmakeTarget: '' });
      const target = workspace.getConfiguration('cmake-llvm-workspace').get('cmakeTarget');

      const provider = new DecorationLocationsProvider({
        workspace,
        statFile: sf.buildFakeSucceedingStatFile(),
        processForCmakeCommand: p.buildFakeSucceedingProcess(),
        processForCmakeTarget: p.buildFakeFailingProcess(),
        globSearch: g.buildFakeGlobSearchForNoMatch(),
        fs: fs.buildFakeFailingFs(),
        llvmCoverageInfoStreamBuilder: s.buildFakeStreamBuilder(s.buildEmptyReadableStream),
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        `Error: Could not build the specified cmake target ${target}. ` +
        `Ensure '${definitions.extensionNameInSettings}: Cmake Target' setting is properly set.`);
    });

  it('should not be able to provide any decoration for uncovered code regions ' +
    'when the coverage info file name does not target an existing file',
    () => {
      const provider = new DecorationLocationsProvider({
        workspace: w.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings({ coverageInfoFileName: 'baadf00d' }),
        statFile: sf.buildFakeSucceedingStatFile(),
        processForCmakeCommand: p.buildFakeSucceedingProcess(),
        processForCmakeTarget: p.buildFakeSucceedingProcess(),
        globSearch: g.buildFakeGlobSearchForNoMatch(),
        fs: fs.buildFakeFailingFs(),
        llvmCoverageInfoStreamBuilder: s.buildFakeStreamBuilder(s.buildEmptyReadableStream),
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        'Cannot resolve the coverage info file path in the build tree directory. ' +
        'Ensure that both ' +
        `'${definitions.extensionNameInSettings}: Build Tree Directory' and ` +
        `'${definitions.extensionNameInSettings}: Coverage Info File Name' ` +
        'settings are correctly set.');
    });

  it('should not not able to provide any decoration for uncovered code regions ' +
    'when there are more than one generated coverage information file that are found', () => {
      const provider = new DecorationLocationsProvider({
        workspace: w.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
        statFile: sf.buildFakeSucceedingStatFile(),
        processForCmakeCommand: p.buildFakeSucceedingProcess(),
        processForCmakeTarget: p.buildFakeSucceedingProcess(),
        globSearch: g.buildFakeGlobSearchForSeveralMatch(),
        fs: fs.buildFakeFailingFs(),
        llvmCoverageInfoStreamBuilder: s.buildFakeStreamBuilder(s.buildEmptyReadableStream),
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
        'More than one coverage information file have been found in the build tree directory. ' +
        'Ensure that both ' +
        `'${definitions.extensionNameInSettings}: Build Tree Directory' and ` +
        `'${definitions.extensionNameInSettings}: Coverage Info File Name' ` +
        'settings are correctly set.');
    });

  describe.skip('the behavior of the coverage info collection with valid minimal json document', () => {
    it('should succed to collect coverage information for the requested file', () => {
      const provider = new DecorationLocationsProvider({
        workspace: w.buildFakeWorkspaceWithWorkspaceFolderAndOverridableDefaultSettings(),
        statFile: sf.buildFakeSucceedingStatFile(),
        processForCmakeCommand: p.buildFakeSucceedingProcess(),
        processForCmakeTarget: p.buildFakeSucceedingProcess(),
        globSearch: g.buildFakeGlobSearchForExactlyOneMatch(),
        fs: fs.buildFakeSucceedingFs(),
        llvmCoverageInfoStreamBuilder: s.buildFakeStreamBuilder(s.buildValidLlvmCoverageJsonObjectStream)
      });

      return provider.getDecorationLocationsForUncoveredCodeRegions('/a/source/file.cpp')
        .should.eventually.be.not.null;
    });
  });
});


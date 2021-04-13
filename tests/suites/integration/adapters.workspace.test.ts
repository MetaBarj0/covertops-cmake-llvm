import * as chai from 'chai';
import * as mocha from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

const describe = mocha.describe;
const it = mocha.it;

import { ExtensionSettings } from '../../../src/environment/extensionSettings';

import * as vscode from 'vscode';

const workspaceFolders = vscode.workspace.workspaceFolders as Array<vscode.WorkspaceFolder>;
const rootFolder = workspaceFolders[0].uri.path;

describe('The way adapters can be instantiated when vscode has an active workspace', () => {
  it('should not throw any exception when instantiating extension settings and settings should be set with default values', () => {
    const settings = new ExtensionSettings();

    settings.buildTreeDirectory.should.be.equal('build');
    settings.cmakeCommand.should.be.equal('cmake');
    settings.cmakeTarget.should.be.equal('reportCoverageDetails');
    settings.coverageInfoFileNamePatterns.should.be.equal('default.covdata.json');
    settings.rootDirectory.should.be.equal(rootFolder);
  });
});
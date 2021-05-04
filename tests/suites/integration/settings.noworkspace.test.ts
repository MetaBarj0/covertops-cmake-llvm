import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';
import { SettingsProvider } from '../../../src/domain/services/settings-provider';
import * as vscode from 'vscode';

chai.use(chaiAsPromised);
chai.should();

describe('Querying settings from a setting provider initialized with a workspace that does not have a root folder.', () => {
  it('should throw an error when settings are queried from a setting provider', () => {
    (() => { new SettingsProvider(vscode.workspace).settings; }).should.throw(
      'A workspace must be loaded to get coverage information.');
  });
});
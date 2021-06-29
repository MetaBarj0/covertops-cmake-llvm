import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as SettingsProvider from '../../../src/domain/services/internal/settings-provider';
import { errorChannel as e } from '../../fakes/adapters/error-channel';

import * as vscode from 'vscode';

describe('Querying settings from a setting provider initialized with a workspace that does not have a root folder.', () => {
  it('should throw an error when settings are queried from a setting provider', () => {
    (() => { SettingsProvider.make({ workspace: vscode.workspace, errorChannel: e.buildFakeErrorChannel() }).settings; }).should.throw(
      'A workspace must be loaded to get coverage information.');
  });
});
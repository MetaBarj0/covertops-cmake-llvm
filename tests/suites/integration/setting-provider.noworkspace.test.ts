import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as Imports from './imports';

describe('Querying settings from a setting provider initialized with a workspace that does not have a root folder.', () => {
  it('should throw an error when settings are queried from a setting provider', () => {
    (() => {
      Imports.Domain.Implementations.SettingsProvider.make({
        workspace: Imports.Adapters.vscode.workspace,
        outputChannel: Imports.Fakes.Adapters.vscode.buildFakeOutputChannel()
      }).settings;
    }).should.throw(
      'A workspace must be loaded to get coverage information.');
  });
});
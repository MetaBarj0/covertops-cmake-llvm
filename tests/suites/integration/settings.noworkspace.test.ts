import * as chai from 'chai';
import * as mocha from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';
import { ExtensionSettings } from '../../../src/environment/extensionSettings';

chai.use(chaiAsPromised);
chai.should();

const describe = mocha.describe;
const it = mocha.it;

describe('Instantiating vscode settings throws an error when vscode has no workspace.', () => {
  it('should throw an error when vscode settings are instantiated from a vscode instance that has no workspace', () => {
    (() => { new ExtensionSettings(); }).should.throw(
      'A workspace must be loaded to get coverage information.');
  });
});
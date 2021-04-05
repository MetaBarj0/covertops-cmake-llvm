import * as chai from 'chai';
import * as mocha from 'mocha';

const assert = chai.assert;
const should = chai.should();
const suite = mocha.suite;
const describe = mocha.describe;
const it = mocha.it;

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { CppLlvmCoverage } from '../../cppLlvmCoverage';

class FakeSettingsForWrongCMakeSetting {
  private cmakeCommand: string = "";

  constructor() {
    throw new Error("foo");
  }
}

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Sample test', () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });

});

describe('Extension behavior regarding its configuration', () => {
  it('Should output an error regarding the cmake command when the setting is empty', () => {
    should.throw(() => { new FakeSettingsForWrongCMakeSetting(); }, "");
  });
});
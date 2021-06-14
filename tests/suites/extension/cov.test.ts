import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as CovFactory from '../../../src/extension/factories/cov';
import { Disposable } from 'vscode';

describe('Extension test suite', () => {
  describe('The cov extension behavior', () => {
    describe('The instantiation of the extension as a vscode disposable', instantiateCovAsDisposableShouldSucceed);
  });
});

function instantiateCovAsDisposableShouldSucceed() {
  it('should succeed when instantiating the extension as a vscode disposable', () => {
    const cov = CovFactory.make();
    const assertion = ((cov: any): cov is Disposable => (cov as Disposable).dispose !== undefined)(cov);

    assertion.should.be.equal(true);
  });
}
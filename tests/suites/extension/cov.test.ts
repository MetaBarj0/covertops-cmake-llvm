import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as CovFactory from '../../../src/extension/factories/cov';
import { Disposable, OutputChannel } from 'vscode';

describe('Extension test suite', () => {
  describe('The cov extension behavior', () => {
    describe('The instantiation of the extension as a vscode disposable', instantiateCovAsDisposableShouldSucceed);
    describe('cov has a working vscode window output channel', covInstanceHasAnOutputChannel);
  });
});

function instantiateCovAsDisposableShouldSucceed() {
  it('should succeed when instantiating the extension as a vscode disposable', () => {
    const cov = CovFactory.make();

    cov.asDisposable.should.be.an.instanceOf(Disposable);
  });
}

function covInstanceHasAnOutputChannel() {
  it('should expose a vscode output channel', () => {
    const cov = CovFactory.make();
    const covExposesAVscodeOutputChannel = ((outputChannel: OutputChannel): outputChannel is OutputChannel => {
      return outputChannel.append !== undefined &&
        outputChannel.appendLine !== undefined &&
        outputChannel.clear !== undefined &&
        outputChannel.dispose !== undefined &&
        outputChannel.hide !== undefined &&
        outputChannel.name !== undefined &&
        outputChannel.show !== undefined;
    })(cov.outputChannel);

    covExposesAVscodeOutputChannel.should.be.equal(true);
  });
}
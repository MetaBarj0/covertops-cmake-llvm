import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

describe('Extension test suite', () => {
  describe('The cov extension behavior', () => {
    describe('The activation of the extension', activateCovExtension);
  });
});

function activateCovExtension() {
  it('should succeed when instantiating the extension', () => {
  });
}
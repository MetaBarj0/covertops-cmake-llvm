import * as chai from 'chai';
import * as mocha from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

const describe = mocha.describe;
const it = mocha.it;

describe('the behavior of the cmake process adapter in a rela environment.', () => {
  it('should not be able to instantiate a real cmake process if cmakeCommand setting is incorrectly set.', () => {
  });

});
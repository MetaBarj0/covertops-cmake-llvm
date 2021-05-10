import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';
import { CoverageDecorations } from '../../../src/domain/value-objects/coverage-decorations';

chai.use(chaiAsPromised);
chai.should();

describe('the contract of the decoration locations object', () => {
  it('should throw an error when attempting to get decorations locations for an unmanaged file', () => {
    const locations = new CoverageDecorations({
      file: '/a/file.cpp',
      locations: [
        {
          begin: {
            line: 1,
            column: 1
          },
          end: {
            line: 1,
            column: 10
          }
        }
      ]
    });

    const requiredFile = '/an/unmanaged/file.cpp';

    (() => { locations.getFor(requiredFile); }).should.throw(
      'Cannot find any uncovered code regions for the file: ' +
      `${requiredFile}. Ensure this file belongs to a project that is covered by at least a test project.`);
  });
});
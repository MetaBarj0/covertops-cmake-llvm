import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';
import { CollectedCoverageInfo } from '../../../src/domain/value-objects/collected-coverage-info';

chai.use(chaiAsPromised);
chai.should();

describe('the contract of collected coverage info object', () => {
  const locations = new CollectedCoverageInfo({
    coverageInfoCollection: [
      {
        file: '/a/file.cpp',
        regions: [
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
        ],
        summary: {
          count: 1,
          covered: 0,
          notCovered: 1,
          percent: 0
        }
      }
    ]
  });

  it('should throw an error when attempting to get collected coverage info from an unmanaged file', () => {
    const requiredFile = '/an/unmanaged/file.cpp';

    (() => { locations.getFor(requiredFile); }).should.throw(
      'Cannot find any uncovered code regions for the file: ' +
      `${requiredFile}. Ensure this file belongs to a project that is covered by at least a test project.`);
  });

  it('should give the right collected coverage info from a managed file', () => {
    const requiredFile = '/a/file.cpp';

    const decorations = locations.getFor(requiredFile);

    decorations.file.should.be.equal(requiredFile);
    decorations.regions.should.be.deep.equal(locations.coverageInfoCollection[0].regions);
    decorations.summary.should.be.deep.equal(locations.coverageInfoCollection[0].summary);
  });
});
import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import { extensionName } from '../../../src/extension-name';
import { UncoveredCodeRegionsCollector } from '../../../src/domain/services/uncovered-code-regions-collector';

import { stream } from '../../builders/fake-adapters';

import buildEmptyReadableStream = stream.buildEmptyReadableStream;
import buildNotJsonStream = stream.buildNotJsonStream;
import buildFakeStreamBuilder = stream.buildFakeStreamBuilder;
import buildFactoryStreamFrom = stream.buildFactoryStreamFrom;
import buildEmptyJsonObjectStream = stream.buildEmptyJsonObjectStream;

describe('UncoveredCodeRegionsCollector behavior with invalid file content', () => {
  [
    buildNotJsonStream,
    buildEmptyReadableStream,
    buildEmptyJsonObjectStream
  ]
    .forEach(factory => {
      it('should throw an exception when attempting to collect uncovered code regions if the input stream ' +
        'does not contain a json document.', () => {
          const collector = new UncoveredCodeRegionsCollector(buildFakeStreamBuilder(factory));

          return collector.collectUncoveredCodeRegions('foo').should.eventually.be.rejectedWith(
            'Invalid coverage information file have been found in the build tree directory. ' +
            'Coverage information file must contain llvm coverage report in json format. ' +
            'Ensure that both ' +
            `'${extensionName}: Build Tree Directory' and '${extensionName}: Coverage Info File Name' ` +
            'settings are correctly set.');
        });
    });

  it('should not throw when streaming on an object containing a non empty array property named "data"', () => {
    const collector = new UncoveredCodeRegionsCollector(buildFakeStreamBuilder(buildFactoryStreamFrom({
      data: [{}]
    })));

    return collector.collectUncoveredCodeRegions('foo').should.eventually.be.fulfilled;
  });
});
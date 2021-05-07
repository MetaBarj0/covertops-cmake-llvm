import * as chai from 'chai';
import { describe, it } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import { extensionName } from '../../../src/extension-name';
import { UncoveredCodeRegionsCollector } from '../../../src/domain/services/uncovered-code-regions-collector';

import { stream } from '../../builders/fake-adapters';

import buildEmptyInputStream = stream.buildEmptyReadableStream;
import buildEmptyJsonObjectStream = stream.buildEmptyJsonObjectStream;
import buildNotJsonStream = stream.buildNotJsonStream;
import buildAnyJsonThatIsNotLlvmCoverageExportStream = stream.buildAnyJsonThatIsNotLlvmCoverageExportStream;
import buildFakeStreamBuilder = stream.buildFakeStreamBuilder;

describe('UncoveredCodeRegionsCollector behavior', () => {
  [
    buildNotJsonStream,
    buildEmptyInputStream,
    buildEmptyJsonObjectStream,
    buildAnyJsonThatIsNotLlvmCoverageExportStream
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
});
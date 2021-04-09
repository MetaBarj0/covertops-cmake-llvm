import * as chai from 'chai';
import * as mocha from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

const describe = mocha.describe;
const it = mocha.it;

import { DecorationLocationProvider } from '../../../src/services/decorationLocationProvider';

import { ExtensionSettings } from '../../../src/environment/extensionSettings';
import { RealCmakeProcess } from '../../../src/environment/realCmakeProcess';
import { FileSystemBuildTreeDirectoryResolver } from '../../../src/environment/fileSystemBuildTreeDirectoryResolver';
import { FileSystemCoverageInfoFilesResolver } from '../../../src/environment/fileSystemCoverageInfoFilesResolver';

describe('DecorationLocationProvider service behavior in a real system environment.', () => {
  it('should behave correctly at instantiation level when passing default vscode settings and faked services.', () => {
    const settings = new ExtensionSettings();
    const cmakeProcess = new RealCmakeProcess();
    const buildTreeDirectoryResolver = new FileSystemBuildTreeDirectoryResolver();
    const coverageInfoFilesResolver = new FileSystemCoverageInfoFilesResolver();

    (() => {
      new DecorationLocationProvider(settings, cmakeProcess,
        buildTreeDirectoryResolver, coverageInfoFilesResolver);
    }).should.not.throw();

  });
});
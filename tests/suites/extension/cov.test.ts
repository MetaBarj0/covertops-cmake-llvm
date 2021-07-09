import * as chai from 'chai';
import { describe, it, before, after, } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

// TODO: imports idiom
import * as Cov from '../../../src/extension/cov';
import { extensionId } from '../../../src/extension/definitions';
import { OutputChannelLike } from '../../../src/shared-kernel/abstractions/vscode';

import { Disposable, commands, window, Uri, workspace, TextEditor } from 'vscode';
import * as path from 'path';

// TODO: all test suites - attempt to use hooks to refacto before, after, ...
describe('Extension test suite', () => {
  describe('The cov extension behavior', () => {
    describe('The instantiation of the extension as a vscode disposable', covShouldBeDisposable);
    describe('The extension has a working vscode window output channel', covShouldHaveAnOutputChannel);
    describe('The extension can leverage vscode api adapters when executing the reportUncoveredRegionsInFile command', covCanExecuteCommand);
    describe('The freshly instantiated extension have an empty uncovered code regions editors collection', covShouldHaveAnEmptyUncoveredCodeRegionsEditorsCollection);
    describe('The cov extension having one virtual readonly editor showing uncovered code regions', covShouldHaveOneUncoveredCodeRegionsEditorOpenedAfterCommandExecution);
  });
});

function covShouldBeDisposable() {
  let cov: ReturnType<typeof Cov.make>;

  before('Instantiating Cov', () => cov = Cov.make());

  it('should succeed when instantiating the extension as a vscode disposable', () => {
    cov.asDisposable.should.be.an.instanceOf(Disposable);
  });

  after('Disposing of cov instance', () => cov.dispose());
}

function covShouldHaveAnOutputChannel() {
  let cov: ReturnType<typeof Cov.make>;

  before('Instantiating Cov', () => cov = Cov.make());

  it('should expose a vscode output channel', () => {
    const covExposesAVscodeOutputChannel = ((_: OutputChannelLike): _ is OutputChannelLike => true)(cov.outputChannel);

    covExposesAVscodeOutputChannel.should.be.equal(true);
  });

  after('Disposing of cov instance', () => cov.dispose());
}

function covCanExecuteCommand() {
  let cov: ReturnType<typeof Cov.make>;

  before('Instantiating Cov', () => cov = Cov.make());

  it('should run the command successfully', async () => {
    const workspaceRootFolder = workspace.workspaceFolders?.[0].uri.fsPath;
    const cppFilePath = path.join(<string>workspaceRootFolder, 'src', 'partiallyCovered', 'partiallyCoveredLib.cpp');

    await window.showTextDocument(Uri.file(cppFilePath), { preserveFocus: false });

    return commands.executeCommand(`${extensionId}.reportUncoveredCodeRegionsInFile`).should.eventually.be.fulfilled;
  });

  after('Disposing of cov instance', () => cov.dispose());
}

function covShouldHaveAnEmptyUncoveredCodeRegionsEditorsCollection() {
  let cov: ReturnType<typeof Cov.make>;

  before('Instantiating Cov', () => cov = Cov.make());

  it('should contain an empty collection of uncovered code regions read only editors', () => {
    const covExposesReadonlyArrayOfTextEditors = ((_: ReadonlyArray<TextEditor>): _ is ReadonlyArray<TextEditor> => true)(cov.uncoveredCodeRegionsEditors);

    covExposesReadonlyArrayOfTextEditors.should.be.equal(true);
    cov.uncoveredCodeRegionsEditors.should.be.empty;
  });

  after('Disposing of cov instance', () => cov.dispose());
}

function covShouldHaveOneUncoveredCodeRegionsEditorOpenedAfterCommandExecution() {
  let cov: ReturnType<typeof Cov.make>;

  before('Instantiating Cov', () => cov = Cov.make());

  it('should have one uncovered code regions editor in the collection that is a virtual read only text editor', async () => {
    // TODO: duplicated 2 tests above
    const workspaceRootFolder = workspace.workspaceFolders?.[0].uri.fsPath;
    const cppFilePath = path.join(<string>workspaceRootFolder, 'src', 'partiallyCovered', 'partiallyCoveredLib.cpp');

    const currentEditor = await window.showTextDocument(Uri.file(cppFilePath), { preserveFocus: false });
    await commands.executeCommand(`${extensionId}.reportUncoveredCodeRegionsInFile`);

    cov.uncoveredCodeRegionsEditors.length.should.equal(1);
    cov.uncoveredCodeRegionsEditors[0].document.uri.scheme.should.be.equal(extensionId);
    cov.uncoveredCodeRegionsEditors[0].document.uri.fsPath.should.be.equal(currentEditor.document.uri.fsPath);
  });

  after('Disposing of cov instance', () => cov.dispose());
}

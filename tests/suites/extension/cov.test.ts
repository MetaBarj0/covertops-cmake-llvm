import * as chai from 'chai';
import { describe, it, after } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as Cov from '../../../src/extension/cov';
import * as Definitions from '../../../src/extension/definitions';
import * as UncoveredCodeRegionsDocumentContentProvider from '../../../src/extension/uncovered-code-regions-document-content-provider';

import * as vscode from 'vscode';
import * as path from 'path';

// TODO: reorganize test suite
describe('Extension test suite', () => {
  describe('The cov extension behavior', () => {
    describe('The instantiation of the extension as a vscode disposable', covShouldBeDisposable);
    describe('The extension has a working vscode window output channel', covShouldHaveAnOutputChannel);
    describe('The extension have a disposable text document provider for uncovered code regions display', covShouldHaveDisposableTextDocumentProviderForUncoveredCodeRegionsDisplay);
    describe('The extension can leverage vscode api adapters when executing the reportUncoveredRegionsInFile command', covCanExecuteCommand);
    describe('The freshly instantiated extension have an empty uncovered code regions editors collection', covShouldHaveAnEmptyUncoveredCodeRegionsEditorsCollection);
    describe('Running several time the same command on the virtual document editor does not create more virtual document editor', covShouldOpenOnlyOneVirtualDocumentEditorPerSourceFile);
    describe('The opened virtual document contain the source code of the file for uncovered code regions request', virtualDocumentShouldContainSameSourceCode);
    describe('The Cov instance can expose the active editor if any', covShouldExposeAnActiveTextEditorProperty);
    describe('Querying for decorations on the cov active text editor targeting a real source file', activeTextEditorOnSourceFileShouldNotHaveAnyDecoration);
    describe.skip('The opened virtual document has some decorations applied on it', virtualDocumentSHouldHaveDecorations);
  });
});

function covShouldBeDisposable() {
  let cov: ReturnType<typeof Cov.make>;

  it('should succeed when instantiating the extension as a vscode disposable', async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make());

    const covIsADisposableResource = ((_: vscode.Disposable): _ is vscode.Disposable => true)(cov.asDisposable);

    covIsADisposableResource.should.be.true;
  });

  after('Disposing of cov instance', () => cov.dispose());
}

function covShouldHaveAnOutputChannel() {
  let cov: ReturnType<typeof Cov.make>;

  it('should expose a vscode output channel', async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make());

    const covExposesAVscodeOutputChannel = ((_: vscode.OutputChannel): _ is vscode.OutputChannel => true)(cov.outputChannel);

    covExposesAVscodeOutputChannel.should.be.equal(true);
  });

  after('Disposing of cov instance', () => cov.dispose());
}

function covCanExecuteCommand() {
  let cov: ReturnType<typeof Cov.make>;

  it('should run the command successfully', async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make());

    const workspaceRootFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    const cppFilePath = path.join(<string>workspaceRootFolder, 'src', 'partiallyCovered', 'partiallyCoveredLib.cpp');

    await vscode.window.showTextDocument(vscode.Uri.file(cppFilePath), { preserveFocus: false });

    return executeCommand().should.eventually.be.fulfilled;
  });

  after('Disposing of cov instance', () => cov.dispose());
}

function covShouldHaveAnEmptyUncoveredCodeRegionsEditorsCollection() {
  let cov: ReturnType<typeof Cov.make>;

  it('should contain an empty collection of uncovered code regions read only editors', async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make());

    const covExposesReadonlyMapOfTextEditors =
      ((_: ReadonlyMap<string, vscode.TextDocument>): _ is ReadonlyMap<string, vscode.TextDocument> => true)(cov.openedUncoveredCodeRegionsDocuments);

    covExposesReadonlyMapOfTextEditors.should.be.true;
    cov.openedUncoveredCodeRegionsDocuments.should.be.empty;
  });

  after('Disposing of cov instance', () => cov.dispose());
}

function covShouldHaveDisposableTextDocumentProviderForUncoveredCodeRegionsDisplay() {
  let cov: ReturnType<typeof Cov.make>;

  it('should create and expose a disposable text document provider', async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make());

    const covExposesDisposableTextDocumentProvider = ((_: vscode.Disposable): _ is vscode.Disposable => true)(cov.uncoveredCodeRegionsDocumentProvider);

    covExposesDisposableTextDocumentProvider.should.be.true;
  });

  after('Disposing of cov instance', () => cov.dispose());
}

function covShouldOpenOnlyOneVirtualDocumentEditorPerSourceFile() {
  let cov: ReturnType<typeof Cov.make>;

  it('should have one uncovered code regions editor in the collection that is a virtual read only text editor', async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make());
    const { cppFilePath, currentEditor } = await showSourceFileEditor();

    for (const _ of Array<never>(10))
      await executeCommand();

    cov.openedUncoveredCodeRegionsDocuments.size.should.be.equal(1);
    chai.assert.notStrictEqual(cov.openedUncoveredCodeRegionsDocuments.get(cppFilePath), undefined);
    cov.openedUncoveredCodeRegionsDocuments.get(cppFilePath)?.uri.scheme.should.be.equal(Definitions.extensionId);
    cov.openedUncoveredCodeRegionsDocuments.get(cppFilePath)?.uri.fsPath.should.be.equal(currentEditor.document.uri.fsPath);
    cov.activeTextEditor?.document.uri.scheme.should.be.equal(Definitions.extensionId);
  });

  after('Disposing of cov instance', () => cov.dispose());
}

function virtualDocumentShouldContainSameSourceCode() {
  let cov: ReturnType<typeof Cov.make>;

  it('should show a virtual document having the same source code that the file on which request for uncovered regions has been done', async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make());
    const { currentEditor } = await showSourceFileEditor();

    await executeCommand();

    chai.assert.notStrictEqual(cov.activeTextEditor, undefined);
    const virtualEditor = <vscode.TextEditor>cov.activeTextEditor;
    virtualEditor.document.getText().should.be.equal(currentEditor.document.getText());
  });

  after('Disposing of cov instance', () => cov.dispose());
}

function virtualDocumentSHouldHaveDecorations() {
  let cov: ReturnType<typeof Cov.make>;

  it('should be possible to query for decorations on the virtual document', async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make());
    const { currentEditor } = await showSourceFileEditor();

    await executeCommand();
  });

  after('Disposing of cov instance', () => cov.dispose());
}

function covShouldExposeAnActiveTextEditorProperty() {
  let cov: ReturnType<typeof Cov.make>;

  it('should be possible to query for the potential active editor', () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make());

    type MaybeTextEditor = vscode.TextEditor | undefined;
    const covExposesActiveEditor = ((_: MaybeTextEditor): _ is MaybeTextEditor => true)(cov.activeTextEditor);

    covExposesActiveEditor.should.be.true;
  });

  after('Disposing of cov instance', () => cov.dispose());
}

function activeTextEditorOnSourceFileShouldNotHaveAnyDecoration() {
  let cov: ReturnType<typeof Cov.make>;

  it('should be possible to access decorations of the active text editor if any', async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make());

    await showSourceFileEditor();

    chai.assert.notStrictEqual(cov.activeTextEditor, undefined);
    cov.activeTextEditor?.decorations.should.be.deep.equal({});
  });

  after('Disposing of cov instance', () => cov.dispose());
}

function buildCppAbsoluteFilePath() {
  const workspaceRootFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  return path.join(<string>workspaceRootFolder, 'src', 'partiallyCovered', 'partiallyCoveredLib.cpp');
}

async function showSourceFileEditor() {
  const cppFilePath = buildCppAbsoluteFilePath();
  const currentEditor = await vscode.window.showTextDocument(vscode.Uri.file(cppFilePath), { preserveFocus: false });
  return { cppFilePath, currentEditor };
}

async function executeCommand() {
  await vscode.commands.executeCommand(`${Definitions.extensionId}.reportUncoveredCodeRegionsInFile`);
}
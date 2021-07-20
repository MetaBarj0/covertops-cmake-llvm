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

describe('Extension test suite', () => {
  describe('The cov extension behavior', () => {
    describe('The instantiation of the extension as a vscode disposable', covShouldBeDisposable);
    describe('The extension has a working vscode window output channel', covShouldHaveAnOutputChannel);
    describe('The extension have a disposable text document provider for uncovered code regions display', covShouldHaveDisposableTextDocumentProviderForUncoveredCodeRegionsDisplay);
    describe('The extension can leverage vscode api adapters when executing the reportUncoveredRegionsInFile command', covCanExecuteCommand);
    describe('The freshly instantiated extension have an empty uncovered code regions editors collection', covShouldHaveAnEmptyUncoveredCodeRegionsEditorsCollection);
    describe('Running several time the same command on the virtual document editor does not create more virtual document editor', covShouldOpenOnlyOneVirtualDocumentEditorPerSourceFile);
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

    return vscode.commands.executeCommand(`${Definitions.extensionId}.reportUncoveredCodeRegionsInFile`).should.eventually.be.fulfilled;
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
    const cppFilePath = buildCppAbsoluteFilePath();
    const currentEditor = await vscode.window.showTextDocument(vscode.Uri.file(cppFilePath), { preserveFocus: false });

    for (const _ of Array<never>(10)) {
      await vscode.commands.executeCommand(`${Definitions.extensionId}.reportUncoveredCodeRegionsInFile`);
    }

    cov.openedUncoveredCodeRegionsDocuments.size.should.be.equal(1);
    chai.assert.notStrictEqual(cov.openedUncoveredCodeRegionsDocuments.get(cppFilePath), undefined);
    cov.openedUncoveredCodeRegionsDocuments.get(cppFilePath)?.uri.scheme.should.be.equal(Definitions.extensionId);
    cov.openedUncoveredCodeRegionsDocuments.get(cppFilePath)?.uri.fsPath.should.be.equal(currentEditor.document.uri.fsPath);
    vscode.window.activeTextEditor?.document.uri.scheme.should.be.equal(Definitions.extensionId);
  });

  after('Disposing of cov instance', () => cov.dispose());
}

function buildCppAbsoluteFilePath() {
  const workspaceRootFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  return path.join(<string>workspaceRootFolder, 'src', 'partiallyCovered', 'partiallyCoveredLib.cpp');
}

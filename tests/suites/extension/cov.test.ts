import * as chai from 'chai';
import { describe, it, before, after, } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as Cov from '../../../src/extension/cov';
import * as Definitions from '../../../src/extension/definitions';
import * as DecorationLocationsProvider from '../../../src/extension/factories/decoration-locations-provider';
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
    describe.skip('The cov extension having one virtual readonly editor showing uncovered code regions', covShouldHaveOneUncoveredCodeRegionsEditorOpenedAfterCommandExecution);
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

    const covExposesReadonlyArrayOfTextEditors =
      ((_: ReadonlyArray<vscode.TextDocument>): _ is ReadonlyArray<vscode.TextDocument> => true)(cov.uncoveredCodeRegionsEditors);

    covExposesReadonlyArrayOfTextEditors.should.be.true;
    cov.uncoveredCodeRegionsEditors.should.be.empty;
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

function covShouldHaveOneUncoveredCodeRegionsEditorOpenedAfterCommandExecution() {
  let cov: ReturnType<typeof Cov.make>;

  it('should have one uncovered code regions editor in the collection that is a virtual read only text editor', async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make());

    const workspaceRootFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    const cppFilePath = path.join(<string>workspaceRootFolder, 'src', 'partiallyCovered', 'partiallyCoveredLib.cpp');

    const currentEditor = await vscode.window.showTextDocument(vscode.Uri.file(cppFilePath), { preserveFocus: false });
    await vscode.commands.executeCommand(`${Definitions.extensionId}.reportUncoveredCodeRegionsInFile`);

    cov.uncoveredCodeRegionsEditors.length.should.equal(1);
    cov.uncoveredCodeRegionsEditors[0].uri.scheme.should.be.equal(Definitions.extensionId);
    cov.uncoveredCodeRegionsEditors[0].uri.fsPath.should.be.equal(currentEditor.document.uri.fsPath);
  });

  after('Disposing of cov instance', () => cov.dispose());
}
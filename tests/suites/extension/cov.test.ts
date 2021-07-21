import * as chai from 'chai';
import { describe, it, after } from 'mocha';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

import * as Cov from '../../../src/extension/cov';
import * as Definitions from '../../../src/extension/definitions';
import * as UncoveredCodeRegionsDocumentContentProvider from '../../../src/extension/uncovered-code-regions-document-content-provider';
import * as DecorationLocationsProvider from '../../../src/extension/factories/decoration-locations-provider';

import * as vscode from 'vscode';
import * as path from 'path';

describe('Extension test suite', () => {
  describe('The cov extension behavior', () => {
    describe('The instantiation of the extension as a vscode disposable', covShouldBeDisposable);
    describe('The extension has a working vscode window output channel', covShouldHaveAnOutputChannel);
    describe('The extension can leverage vscode api adapters when executing the reportUncoveredRegionsInFile command', covCanExecuteCommand);
    describe('Running several time the same command on the virtual document editor does not create more virtual document editor', covShouldOpenOnlyOneVirtualDocumentEditorPerSourceFile);
    describe('The opened virtual document contains the source code of the file for uncovered code regions request', virtualDocumentShouldContainSameSourceCode);
    describe('Uncovered code regions virtual text editor existence when source file is open but command is not executed', uncoveredCodeRegionsVirtualTextEditorOnSourceFileShouldNotExist);
    describe('Uncovered code regions virtual text editor exposing some decoration after the command execution', virtualDocumentShouldHaveSomeDecorationsAfterCommandExecutionOnAPartiallyCoveredFile);
  });
});

function covShouldBeDisposable() {
  let cov: ReturnType<typeof Cov.make>;

  it('should succeed when instantiating the extension as a vscode disposable', async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make(), await DecorationLocationsProvider.make());

    const covIsADisposableResource = ((_: vscode.Disposable): _ is vscode.Disposable => true)(cov.asDisposable);

    covIsADisposableResource.should.be.true;
  });

  after('Disposing of cov instance', () => cov.dispose());
}

// TODO: may be disposed
function covShouldHaveAnOutputChannel() {
  let cov: ReturnType<typeof Cov.make>;

  it('should expose a vscode output channel', async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make(), await DecorationLocationsProvider.make());

    const covExposesAVscodeOutputChannel = ((_: vscode.OutputChannel): _ is vscode.OutputChannel => true)(cov.outputChannel);

    covExposesAVscodeOutputChannel.should.be.equal(true);
  });

  after('Disposing of cov instance', () => cov.dispose());
}

function covCanExecuteCommand() {
  let cov: ReturnType<typeof Cov.make>;

  it('should run the command successfully', async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make(), await DecorationLocationsProvider.make());

    const workspaceRootFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    const cppFilePath = path.join(<string>workspaceRootFolder, 'src', 'partiallyCovered', 'partiallyCoveredLib.cpp');

    await vscode.window.showTextDocument(vscode.Uri.file(cppFilePath), { preserveFocus: false });

    return executeCommand().should.eventually.be.fulfilled;
  });

  after('Disposing of cov instance', () => cov.dispose());
}

function covShouldOpenOnlyOneVirtualDocumentEditorPerSourceFile() {
  let cov: ReturnType<typeof Cov.make>;

  it('should have one uncovered code regions editor in the collection that is a virtual read only text editor', async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make(), await DecorationLocationsProvider.make());
    const { cppFilePath, currentEditor } = await showSourceFileEditor();

    for (const _ of Array<never>(3))
      await executeCommand();

    cov.uncoveredCodeRegionsVirtualTextEditors.size.should.be.equal(1);
    chai.assert.notStrictEqual(cov.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath), undefined);
    cov.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath)?.document.uri.scheme.should.be.equal(Definitions.extensionId);
    cov.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath)?.document.uri.fsPath.should.be.equal(currentEditor.document.uri.fsPath);
    vscode.window.activeTextEditor?.document.uri.scheme.should.be.equal(Definitions.extensionId);
  });

  after('Disposing of cov instance', () => cov.dispose());
}

function virtualDocumentShouldContainSameSourceCode() {
  let cov: ReturnType<typeof Cov.make>;

  it('should show a virtual document having the same source code that the file on which request for uncovered regions has been done', async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make(), await DecorationLocationsProvider.make());
    const { currentEditor } = await showSourceFileEditor();

    await executeCommand();

    chai.assert.notStrictEqual(vscode.window.activeTextEditor, undefined);
    const virtualEditor = <vscode.TextEditor>vscode.window.activeTextEditor;
    virtualEditor.document.getText().should.be.equal(currentEditor.document.getText());
  });

  after('Disposing of cov instance', () => cov.dispose());
}

function uncoveredCodeRegionsVirtualTextEditorOnSourceFileShouldNotExist() {
  let cov: ReturnType<typeof Cov.make>;

  it('should not exist any uncovered code regions virtual editor', async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make(), await DecorationLocationsProvider.make());

    await showSourceFileEditor();

    chai.assert.notStrictEqual(vscode.window.activeTextEditor, undefined);
    cov.uncoveredCodeRegionsVirtualTextEditors.size.should.be.equal(0);
  });

  after('Disposing of cov instance', () => cov.dispose());
}

function virtualDocumentShouldHaveSomeDecorationsAfterCommandExecutionOnAPartiallyCoveredFile() {
  let cov: ReturnType<typeof Cov.make>;

  it('is possible to query decorations for a virtual document editor that have some', async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make(), await DecorationLocationsProvider.make());
    const expectedRange = new vscode.Range(6, 53, 6, 71);
    const expectedDecorations = {
      decorationType: cov.decorationType,
      rangesOrOptions: [expectedRange]
    };

    const { cppFilePath } = await showSourceFileEditor();
    await executeCommand();

    chai.assert.notStrictEqual(cov.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath)?.decorations, undefined);
    cov.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath)?.decorations?.should.be.deep.equal(expectedDecorations);
  });

  after('Disposing of cov instance', () => cov.dispose());
}

function buildCppAbsoluteFilePath() {
  const workspaceRootFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  return path.join(<string>workspaceRootFolder, 'src', 'partiallyCovered', 'partiallyCoveredLib.cpp');
}

async function showSourceFileEditor() {
  const cppFilePath = buildCppAbsoluteFilePath();
  const editor = await vscode.window.showTextDocument(vscode.Uri.file(cppFilePath), { preserveFocus: false });
  return { cppFilePath, currentEditor: editor };
}

async function executeCommand() {
  await vscode.commands.executeCommand(`${Definitions.extensionId}.reportUncoveredCodeRegionsInFile`);
}
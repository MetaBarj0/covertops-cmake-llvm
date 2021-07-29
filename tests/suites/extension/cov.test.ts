import * as chai from "chai";
import { describe, it, after, before } from "mocha";
import * as chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
chai.should();

import * as Cov from "../../../src/extension/implementations/cov";
import * as Definitions from "../../../src/extension/implementations/definitions";
import * as UncoveredCodeRegionsDocumentContentProvider from "../../../src/extension/implementations/uncovered-code-regions-document-content-provider";
import * as UncoveredCodeRegionsVirtualTextEditor from "../../../src/extension/factories/uncovered-code-regions-virtual-text-editor";

import * as vscode from "vscode";
import * as path from "path";

describe("Extension test suite", () => {
  describe("The cov extension behavior", () => {
    describe("The instantiation of the extension as a vscode disposable", covShouldBeDisposable);
    describe("The extension has a working vscode window output channel", covShouldHaveAnOutputChannel);
    describe("The extension can leverage vscode api adapters when executing the reportUncoveredRegionsInFile command", covCanExecuteCommand);
    describe("Running several time the same command on the virtual document editor does not create more virtual document editor", covShouldOpenOnlyOneVirtualDocumentEditorPerSourceFile);
    describe("The opened virtual document contains the source code of the file for uncovered code regions request", virtualDocumentShouldContainSameSourceCode);
    describe("Uncovered code regions virtual text editor existence when source file is open but command is not executed", uncoveredCodeRegionsVirtualTextEditorOnSourceFileShouldNotExist);
    describe("Uncovered code regions virtual text editor showing decorations after the command execution", virtualDocumentShouldHaveSomeDecorationsAfterCommandExecutionOnAPartiallyCoveredFile);
    describe.skip("Switching from any editor to the uncovered code regions virtual text editor should automatically refresh decorations if applicable", shouldRefreshUncoveredCodeRegionInVirtualTextEditor);
  });
});

function covShouldBeDisposable() {
  let cov: ReturnType<typeof Cov.make>;

  it("should succeed when instantiating the extension as a vscode disposable", async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make(), UncoveredCodeRegionsVirtualTextEditor.make());

    const covIsADisposableResource = ((_: vscode.Disposable): _ is vscode.Disposable => true)(cov.asDisposable);

    covIsADisposableResource.should.be.true;
  });

  after("Disposing of cov instance", () => cov.dispose());
}

function covShouldHaveAnOutputChannel() {
  let cov: ReturnType<typeof Cov.make>;

  it("should expose a vscode output channel", async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make(), UncoveredCodeRegionsVirtualTextEditor.make());

    const covExposesAVscodeOutputChannel = ((_: vscode.OutputChannel): _ is vscode.OutputChannel => true)(cov.outputChannel);

    covExposesAVscodeOutputChannel.should.be.equal(true);
  });

  after("Disposing of cov instance", () => cov.dispose());
}

function covCanExecuteCommand() {
  let cov: ReturnType<typeof Cov.make>;

  it("should run the command successfully", async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make(), UncoveredCodeRegionsVirtualTextEditor.make());

    const workspaceRootFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    const cppFilePath = path.join(<string>workspaceRootFolder, "src", "partiallyCovered", "partiallyCoveredLib.cpp");

    await vscode.window.showTextDocument(vscode.Uri.file(cppFilePath), { preserveFocus: false });

    return executeCommand().should.eventually.be.fulfilled;
  });

  after("Disposing of cov instance", () => cov.dispose());
}

function covShouldOpenOnlyOneVirtualDocumentEditorPerSourceFile() {
  let cov: ReturnType<typeof Cov.make>;

  it("should have one uncovered code regions editor in the collection that is a virtual read only text editor", async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make(), UncoveredCodeRegionsVirtualTextEditor.make());
    const { cppFilePath, currentEditor } = await showSourceFileEditor();

    for (const _ of Array<never>(3))
      await executeCommand();

    cov.uncoveredCodeRegionsVirtualTextEditors.size.should.be.equal(1);
    chai.assert.notStrictEqual(cov.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath), undefined);
    cov.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath)?.document.uri.scheme.should.be.equal(Definitions.extensionId);
    cov.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath)?.document.uri.fsPath.should.be.equal(currentEditor.document.uri.fsPath);
    vscode.window.activeTextEditor?.document.uri.scheme.should.be.equal(Definitions.extensionId);
  });

  after("Disposing of cov instance", () => cov.dispose());
}

function virtualDocumentShouldContainSameSourceCode() {
  let cov: ReturnType<typeof Cov.make>;

  it("should show a virtual document having the same source code that the file on which request for uncovered regions has been done", async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make(), UncoveredCodeRegionsVirtualTextEditor.make());
    const { currentEditor } = await showSourceFileEditor();

    await executeCommand();

    chai.assert.notStrictEqual(vscode.window.activeTextEditor, undefined);
    const virtualEditor = <vscode.TextEditor>vscode.window.activeTextEditor;
    virtualEditor.document.getText().should.be.equal(currentEditor.document.getText());
  });

  after("Disposing of cov instance", () => cov.dispose());
}

function uncoveredCodeRegionsVirtualTextEditorOnSourceFileShouldNotExist() {
  let cov: ReturnType<typeof Cov.make>;

  it("should not exist any uncovered code regions virtual editor", async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make(), UncoveredCodeRegionsVirtualTextEditor.make());

    await showSourceFileEditor();

    chai.assert.notStrictEqual(vscode.window.activeTextEditor, undefined);
    cov.uncoveredCodeRegionsVirtualTextEditors.size.should.be.equal(0);
  });

  after("Disposing of cov instance", () => cov.dispose());
}

function virtualDocumentShouldHaveSomeDecorationsAfterCommandExecutionOnAPartiallyCoveredFile() {
  let cov: ReturnType<typeof Cov.make>;

  it("is possible to query decorations for a virtual document editor that have some", async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make(), UncoveredCodeRegionsVirtualTextEditor.make());
    const expectedRange = new vscode.Range(5, 52, 5, 70);
    const expectedRangeOrOptions = [
      {
        range: expectedRange,
        hoverMessage: "This code region is not covered by a test known by cmake."
      }
    ];
    const { cppFilePath } = await showSourceFileEditor();

    await executeCommand();

    chai.assert.notStrictEqual(cov.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath)?.decorations, undefined);
    chai.assert.isDefined(cov.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath)?.decorations?.decorationType);
    cov.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath)?.decorations?.rangesOrOptions.should.be.deep.equal(expectedRangeOrOptions);
  });

  after("Disposing of cov instance", () => cov.dispose());
}

function shouldRefreshUncoveredCodeRegionInVirtualTextEditor() {
  let cov: ReturnType<typeof Cov.make>;

  before("Displaying decorations and showing source file editor", async () => {
    cov = Cov.make(UncoveredCodeRegionsDocumentContentProvider.make(), UncoveredCodeRegionsVirtualTextEditor.make());

    await showSourceFileEditor();
    await executeCommand();
    await showSourceFileEditor();
  });

  it("should auto refresh decorations in existing virtual text editor", async () => {
    const uri = vscode.Uri.from({
      scheme: Definitions.extensionId,
      path: vscode.window.activeTextEditor?.document.uri.path
    });

    await vscode.window.showTextDocument(uri);

    chai.assert(false, "This test is not implemented");
  });

  after("Disposing of cov instance", () => cov.dispose());
}

function buildCppAbsoluteFilePath() {
  const workspaceRootFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

  return path.join(<string>workspaceRootFolder, "src", "partiallyCovered", "partiallyCoveredLib.cpp");
}

async function showSourceFileEditor() {
  const cppFilePath = buildCppAbsoluteFilePath();
  const editor = await vscode.window.showTextDocument(vscode.Uri.file(cppFilePath), { preserveFocus: false });

  return { cppFilePath, currentEditor: editor };
}

async function executeCommand() {
  // TODO: use Strings here
  await vscode.commands.executeCommand(`${Definitions.extensionId}.reportUncoveredCodeRegionsInFile`);
}

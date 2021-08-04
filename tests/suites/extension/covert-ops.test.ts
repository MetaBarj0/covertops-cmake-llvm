import * as chai from "chai";
import { describe, it, before, after } from "mocha";
import * as chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
chai.should();

import * as Types from "./types";

import * as CovertOps from "../../../src/extension/implementations/covert-ops";
import * as Definitions from "../../../src/extension/implementations/definitions";
import * as UncoveredCodeRegionsDocumentContentProvider from "../../../src/extension/implementations/uncovered-code-regions-document-content-provider";
import * as UncoveredCodeRegionsVirtualTextEditorFactory from "../../../src/extension/factories/uncovered-code-regions-virtual-text-editor";
import { UncoveredCodeRegionsVirtualTextEditor } from "../../../src/extension/implementations/uncovered-code-regions-virtual-text-editor";
import * as OutputChannel from "../../../src/extension/implementations/output-channel";
import * as Strings from "../../../src/strings";

import { buildEventBasedSpyForUncoveredCodeRegionsVirtualTextEditor } from "../../fakes/extension/uncovered-code-regions-virtual-text-editor";
import { buildSpyOfOutputChannel } from "../../fakes/adapters/vscode";
import { SpyEventEmitterFor } from "../../utils/spy-event-emitter-for";

import * as vscode from "vscode";
import * as path from "path";

describe("Extension test suite", () => {
  describe("The covert ops extension behavior", () => {
    describe("The instantiation of the extension as a vscode disposable", covShouldBeDisposable);
    describe("The extension has a working vscode window output channel", covShouldHaveAnOutputChannel);
    describe("The extension can leverage vscode api adapters when executing the reportUncoveredRegionsInFile command", covCanExecuteCommand);
    describe("Running several time the same command on the virtual document editor does not create more virtual document editor", covShouldOpenOnlyOneVirtualDocumentEditorPerSourceFile);
    describe("The opened virtual document contains the source code of the file for uncovered code regions request", virtualDocumentShouldContainSameSourceCode);
    describe("Uncovered code regions virtual text editor existence when source file is open but command is not executed", uncoveredCodeRegionsVirtualTextEditorOnSourceFileShouldNotExist);
    describe("Uncovered code regions virtual text editor showing decorations after the command execution", virtualDocumentShouldHaveSomeDecorationsAfterCommandExecutionOnAPartiallyCoveredFile);
    describe("Showing an uncovered code regions virtual text editor should automatically trigger a decorations refresh", shouldRefreshUncoveredCodeRegionInVirtualTextEditor);
    describe("Running the command to get coverage info shows summary info in the output window", shouldShowSummaryCoverageInfoForFile);
  });
});

function covShouldBeDisposable() {
  let covertOps: Types.Extension.CovertOps;

  it("should succeed when instantiating the extension as a vscode disposable", async () => {
    covertOps = CovertOps.make({
      uncoveredCodeRegionsDocumentContentProvider: UncoveredCodeRegionsDocumentContentProvider.make(),
      uncoveredCodeRegionsVirtualTextEditorFactory: UncoveredCodeRegionsVirtualTextEditorFactory.make(),
      outputChannel: OutputChannel.make(vscode.window.createOutputChannel(Definitions.extensionId))
    });

    const covIsADisposableResource = ((_: vscode.Disposable): _ is vscode.Disposable => true)(covertOps.asDisposable);

    covIsADisposableResource.should.be.true;
  });

  after("Disposing of covert ops instance", () => covertOps.dispose());
}

function covShouldHaveAnOutputChannel() {
  let covertOps: Types.Extension.CovertOps;

  it("should expose a vscode output channel", async () => {
    covertOps = CovertOps.make({
      uncoveredCodeRegionsDocumentContentProvider: UncoveredCodeRegionsDocumentContentProvider.make(),
      uncoveredCodeRegionsVirtualTextEditorFactory: UncoveredCodeRegionsVirtualTextEditorFactory.make(),
      outputChannel: OutputChannel.make(vscode.window.createOutputChannel(Definitions.extensionId))
    });

    const covExposesAVscodeOutputChannel = ((_: Types.Adapters.vscode.OutputChannelLike): _ is Types.Adapters.vscode.OutputChannelLike => true)(covertOps.outputChannel);

    covExposesAVscodeOutputChannel.should.be.equal(true);
  });

  after("Disposing of covert ops instance", () => covertOps.dispose());
}

function covCanExecuteCommand() {
  let covertOps: Types.Extension.CovertOps;

  it("should run the command successfully", async () => {
    covertOps = CovertOps.make({
      uncoveredCodeRegionsDocumentContentProvider: UncoveredCodeRegionsDocumentContentProvider.make(),
      uncoveredCodeRegionsVirtualTextEditorFactory: UncoveredCodeRegionsVirtualTextEditorFactory.make(),
      outputChannel: OutputChannel.make(vscode.window.createOutputChannel(Definitions.extensionId))
    });

    await showSourceFileEditor();

    return executeCommand().should.eventually.be.fulfilled;
  });

  after("Disposing of covert ops instance", () => covertOps.dispose());
}

function covShouldOpenOnlyOneVirtualDocumentEditorPerSourceFile() {
  let covertOps: Types.Extension.CovertOps;

  it("should have one uncovered code regions editor in the collection that is a virtual read only text editor", async () => {
    covertOps = CovertOps.make({
      uncoveredCodeRegionsDocumentContentProvider: UncoveredCodeRegionsDocumentContentProvider.make(),
      uncoveredCodeRegionsVirtualTextEditorFactory: UncoveredCodeRegionsVirtualTextEditorFactory.make(),
      outputChannel: OutputChannel.make(vscode.window.createOutputChannel(Definitions.extensionId))
    });
    const { cppFilePath, currentEditor } = await showSourceFileEditor();

    // TODO: more explicit man!
    for (const _ of Array<never>(3))
      await executeCommand();

    covertOps.uncoveredCodeRegionsVirtualTextEditors.size.should.be.equal(1);
    chai.assert.notStrictEqual(covertOps.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath), undefined);
    covertOps.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath)?.document.uri.scheme.should.be.equal(Definitions.extensionId);
    covertOps.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath)?.document.uri.fsPath.should.be.equal(currentEditor.document.uri.fsPath);
    vscode.window.activeTextEditor?.document.uri.scheme.should.be.equal(Definitions.extensionId);
  });

  after("Disposing of covert ops instance", () => covertOps.dispose());
}

function virtualDocumentShouldContainSameSourceCode() {
  let covertOps: Types.Extension.CovertOps;

  it("should show a virtual document having the same source code that the file on which request for uncovered regions has been done", async () => {
    covertOps = CovertOps.make({
      uncoveredCodeRegionsDocumentContentProvider: UncoveredCodeRegionsDocumentContentProvider.make(),
      uncoveredCodeRegionsVirtualTextEditorFactory: UncoveredCodeRegionsVirtualTextEditorFactory.make(),
      outputChannel: OutputChannel.make(vscode.window.createOutputChannel(Definitions.extensionId))
    });
    const { currentEditor } = await showSourceFileEditor();

    await executeCommand();

    chai.assert.notStrictEqual(vscode.window.activeTextEditor, undefined);
    const virtualEditor = <vscode.TextEditor>vscode.window.activeTextEditor;
    virtualEditor.document.getText().should.be.equal(currentEditor.document.getText());
  });

  after("Disposing of covert ops instance", () => covertOps.dispose());
}

function uncoveredCodeRegionsVirtualTextEditorOnSourceFileShouldNotExist() {
  let covertOps: Types.Extension.CovertOps;

  it("should not exist any uncovered code regions virtual editor", async () => {
    covertOps = CovertOps.make({
      uncoveredCodeRegionsDocumentContentProvider: UncoveredCodeRegionsDocumentContentProvider.make(),
      uncoveredCodeRegionsVirtualTextEditorFactory: UncoveredCodeRegionsVirtualTextEditorFactory.make(),
      outputChannel: OutputChannel.make(vscode.window.createOutputChannel(Definitions.extensionId))
    });

    await showSourceFileEditor();

    chai.assert.notStrictEqual(vscode.window.activeTextEditor, undefined);
    covertOps.uncoveredCodeRegionsVirtualTextEditors.size.should.be.equal(0);
  });

  after("Disposing of covert ops instance", () => covertOps.dispose());
}

function virtualDocumentShouldHaveSomeDecorationsAfterCommandExecutionOnAPartiallyCoveredFile() {
  let covertOps: Types.Extension.CovertOps;

  it("is possible to query decorations for a virtual document editor that have some", async () => {
    covertOps = CovertOps.make({
      uncoveredCodeRegionsDocumentContentProvider: UncoveredCodeRegionsDocumentContentProvider.make(),
      uncoveredCodeRegionsVirtualTextEditorFactory: UncoveredCodeRegionsVirtualTextEditorFactory.make(),
      outputChannel: OutputChannel.make(vscode.window.createOutputChannel(Definitions.extensionId))
    });
    const expectedRange = new vscode.Range(5, 52, 5, 70);
    const expectedRangeOrOptions = [
      {
        range: expectedRange,
        hoverMessage: "This code region is not covered by a test known by cmake."
      }
    ];
    const { cppFilePath } = await showSourceFileEditor();

    await executeCommand();

    chai.assert.notStrictEqual(covertOps.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath)?.decorations, undefined);
    chai.assert.isDefined(covertOps.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath)?.decorations?.decorationType);
    covertOps.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath)?.decorations?.rangesOrOptions.should.be.deep.equal(expectedRangeOrOptions);
  });

  after("Disposing of covert ops instance", () => covertOps.dispose());
}

function shouldRefreshUncoveredCodeRegionInVirtualTextEditor() {
  let covertOps: Types.Extension.CovertOps;

  before("showing a source file editor beforehand", showSourceFileEditor);

  it("should auto refresh decorations in existing virtual text editor", async () => {
    const event = buildEventForUncoveredCodeRegionsVirtualTextEditorSpy();
    let callCount = 0;
    event.onIncrementedCallCount(count => { callCount = count; });
    covertOps = CovertOps.make({
      uncoveredCodeRegionsDocumentContentProvider: UncoveredCodeRegionsDocumentContentProvider.make(),
      uncoveredCodeRegionsVirtualTextEditorFactory: makeEventBasedSpyOfUncoveredCodeRegionsVirtualTextEditor(event),
      outputChannel: OutputChannel.make(vscode.window.createOutputChannel(Definitions.extensionId))
    });

    await executeCommandThenSwitchBetweenSourceFileAndUncoveredCodeRegionsVirtualTextEditor(covertOps);

    callCount.should.be.equal(1);
  });

  after("Disposing of covert ops instance", () => covertOps.dispose());
}

function shouldShowSummaryCoverageInfoForFile() {
  let covertOps: Types.Extension.CovertOps;

  it("should show the right summary info in the output window", async () => {
    const outputChannelSpy = buildSpyOfOutputChannel(OutputChannel.make(vscode.window.createOutputChannel(Definitions.extensionId)));
    const { cppFilePath } = await showSourceFileEditor();
    const expectedSummary = `Coverage summary for ${cppFilePath}: 2 regions, 1 are covered and 1 are not covered. This file is 50% covered.`;
    covertOps = CovertOps.make({
      uncoveredCodeRegionsDocumentContentProvider: UncoveredCodeRegionsDocumentContentProvider.make(),
      uncoveredCodeRegionsVirtualTextEditorFactory: UncoveredCodeRegionsVirtualTextEditorFactory.make(),
      outputChannel: outputChannelSpy.object
    });

    await executeCommand();

    outputChannelSpy.countFor("appendLine").should.be.equal(2);
    outputChannelSpy.object.lines[1].should.be.equal(expectedSummary);
  });

  after("Disposing of covert ops instance", () => covertOps.dispose());
}

async function executeCommandThenSwitchBetweenSourceFileAndUncoveredCodeRegionsVirtualTextEditor(covertOps: Types.Extension.CovertOps) {
  await executeCommand();
  const { cppFilePath } = await showSourceFileEditor();
  const uncoveredCodeRegionsVirtualTextEditor = <Types.Extension.UncoveredCodeRegionsVirtualTextEditor>covertOps.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath);
  await vscode.window.showTextDocument(uncoveredCodeRegionsVirtualTextEditor.document);
}

function buildEventForUncoveredCodeRegionsVirtualTextEditorSpy() {
  return new SpyEventEmitterFor<Types.Extension.UncoveredCodeRegionsVirtualTextEditor>({
    eventType: "incrementedCallCount",
    member: "refreshDecorations"
  });
}

function makeEventBasedSpyOfUncoveredCodeRegionsVirtualTextEditor(eventForSpy: SpyEventEmitterFor<Types.Extension.UncoveredCodeRegionsVirtualTextEditor>) {
  return (textEditor: Types.Extension.TextEditorLike) => {
    const uncoveredCodeRegionsVirtualTextEditor = new UncoveredCodeRegionsVirtualTextEditor(textEditor);

    return buildEventBasedSpyForUncoveredCodeRegionsVirtualTextEditor({
      uncoveredCodeRegionsVirtualTextEditor,
      eventForSpy
    }).object;
  };
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
  await vscode.commands.executeCommand(Strings.commandReportUncoveredCodeRegionsInFile);
}

// TODO(wip): refacto the suite of test, particularly faked stuff
import * as chai from "chai";
import { describe, it, before, after } from "mocha";
import * as chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
chai.should();

import * as Types from "../../../src/types";

import * as CovertOps from "../../../src/modules/implementations/extension/covert-ops";
import * as Definitions from "../../../src/definitions";
import * as UncoveredCodeRegionsDocumentContentProvider from "../../../src/adapters/implementations/vscode/uncovered-code-regions-document-content-provider";
import * as UncoveredCodeRegionsVirtualTextEditorFactory from "../../../src/factories/uncovered-code-regions-virtual-text-editor";
import * as UncoveredCodeRegionsVirtualTextEditor from "../../../src/adapters/implementations/vscode/uncovered-code-regions-virtual-text-editor";
import * as OutputChannel from "../../../src/adapters/implementations/vscode/output-channel";
import * as Strings from "../../../src/strings";

import { buildEventBasedSpyForUncoveredCodeRegionsVirtualTextEditor } from "../../fakes/extension/uncovered-code-regions-virtual-text-editor";
import { buildSpyOfOutputChannel } from "../../fakes/adapters/vscode";
import { SpyEventEmitterFor } from "../../utils/spy-event-emitter-for";
import { defaultSetting } from "../../builders/settings";

import * as vscode from "vscode";
import * as path from "path";

describe("Integration test suite", () => {
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
    describe("Changing the configuration of the extension should mark existing decorations in all virtual text editor as outdated", configurationChangeShouldMarkDecorationsAsOutdated);
  });
});

function covShouldBeDisposable() {
  let covertOps: Types.Modules.Extension.CovertOps;

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
  let covertOps: Types.Modules.Extension.CovertOps;

  it("should expose a vscode output channel", async () => {
    covertOps = CovertOps.make({
      uncoveredCodeRegionsDocumentContentProvider: UncoveredCodeRegionsDocumentContentProvider.make(),
      uncoveredCodeRegionsVirtualTextEditorFactory: UncoveredCodeRegionsVirtualTextEditorFactory.make(),
      outputChannel: OutputChannel.make(vscode.window.createOutputChannel(Definitions.extensionId))
    });

    const covExposesAVscodeOutputChannel = doesCovertOpsHaveAnOutputChannel(covertOps);

    covExposesAVscodeOutputChannel.should.be.equal(true);
  });

  after("Disposing of covert ops instance", () => covertOps.dispose());
}

function covCanExecuteCommand() {
  let covertOps: Types.Modules.Extension.CovertOps;

  it("should run the command successfully", async () => {
    covertOps = CovertOps.make({
      uncoveredCodeRegionsDocumentContentProvider: UncoveredCodeRegionsDocumentContentProvider.make(),
      uncoveredCodeRegionsVirtualTextEditorFactory: UncoveredCodeRegionsVirtualTextEditorFactory.make(),
      outputChannel: OutputChannel.make(vscode.window.createOutputChannel(Definitions.extensionId))
    });

    await showPartiallyCoveredSourceFileEditor("partiallyCoveredLib.cpp");

    return executeCommand().should.eventually.be.fulfilled;
  });

  after("Disposing of covert ops instance", () => covertOps.dispose());
}

function covShouldOpenOnlyOneVirtualDocumentEditorPerSourceFile() {
  let covertOps: Types.Modules.Extension.CovertOps;

  it("should have one uncovered code regions editor in the collection that is a virtual read only text editor", async () => {
    covertOps = CovertOps.make({
      uncoveredCodeRegionsDocumentContentProvider: UncoveredCodeRegionsDocumentContentProvider.make(),
      uncoveredCodeRegionsVirtualTextEditorFactory: UncoveredCodeRegionsVirtualTextEditorFactory.make(),
      outputChannel: OutputChannel.make(vscode.window.createOutputChannel(Definitions.extensionId))
    });
    const { cppFilePath, currentEditor } = await showPartiallyCoveredSourceFileEditor("partiallyCoveredLib.cpp");

    await executeCommandThreeTimes();

    ensureCovertOpsCorrectStateRegardingContext(covertOps, cppFilePath, currentEditor);
  });

  after("Disposing of covert ops instance", () => covertOps.dispose());
}

function virtualDocumentShouldContainSameSourceCode() {
  let covertOps: Types.Modules.Extension.CovertOps;

  it("should show a virtual document having the same source code that the file on which request for uncovered regions has been done", async () => {
    covertOps = CovertOps.make({
      uncoveredCodeRegionsDocumentContentProvider: UncoveredCodeRegionsDocumentContentProvider.make(),
      uncoveredCodeRegionsVirtualTextEditorFactory: UncoveredCodeRegionsVirtualTextEditorFactory.make(),
      outputChannel: OutputChannel.make(vscode.window.createOutputChannel(Definitions.extensionId))
    });
    const { currentEditor } = await showPartiallyCoveredSourceFileEditor("partiallyCoveredLib.cpp");

    await executeCommand();

    ensureVirtualEditorHasTheSameContentAsTheSourceFileEditor(currentEditor);
  });

  after("Disposing of covert ops instance", () => covertOps.dispose());
}

function uncoveredCodeRegionsVirtualTextEditorOnSourceFileShouldNotExist() {
  let covertOps: Types.Modules.Extension.CovertOps;

  it("should not exist any uncovered code regions virtual editor", async () => {
    covertOps = CovertOps.make({
      uncoveredCodeRegionsDocumentContentProvider: UncoveredCodeRegionsDocumentContentProvider.make(),
      uncoveredCodeRegionsVirtualTextEditorFactory: UncoveredCodeRegionsVirtualTextEditorFactory.make(),
      outputChannel: OutputChannel.make(vscode.window.createOutputChannel(Definitions.extensionId))
    });

    await showPartiallyCoveredSourceFileEditor("partiallyCoveredLib.cpp");

    chai.assert.notStrictEqual(vscode.window.activeTextEditor, undefined);
    covertOps.uncoveredCodeRegionsVirtualTextEditors.size.should.be.equal(0);
  });

  after("Disposing of covert ops instance", () => covertOps.dispose());
}

function virtualDocumentShouldHaveSomeDecorationsAfterCommandExecutionOnAPartiallyCoveredFile() {
  let covertOps: Types.Modules.Extension.CovertOps;

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
    const { cppFilePath } = await showPartiallyCoveredSourceFileEditor("partiallyCoveredLib.cpp");

    await executeCommand();

    chai.assert.notStrictEqual(covertOps.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath)?.decorations, undefined);
    chai.assert.isDefined(covertOps.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath)?.decorations?.decorationType);
    covertOps.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath)?.decorations?.rangesOrOptions.should.be.deep.equal(expectedRangeOrOptions);
  });

  after("Disposing of covert ops instance", () => covertOps.dispose());
}

function shouldRefreshUncoveredCodeRegionInVirtualTextEditor() {
  let covertOps: Types.Modules.Extension.CovertOps;

  before("showing a source file editor beforehand", () => { showPartiallyCoveredSourceFileEditor("partiallyCoveredLib.cpp"); });

  it("should auto refresh decorations in existing virtual text editor", async () => {
    const event = buildRefreshDecorationsEventForUncoveredCodeRegionsVirtualTextEditorSpy();
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
  let covertOps: Types.Modules.Extension.CovertOps;

  it("should show the right summary info in the output window", async () => {
    const outputChannelSpy = buildSpyOfOutputChannel(OutputChannel.make(vscode.window.createOutputChannel(Definitions.extensionId)));
    const { cppFilePath } = await showPartiallyCoveredSourceFileEditor("partiallyCoveredLib.cpp");
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

function configurationChangeShouldMarkDecorationsAsOutdated() {
  let covertOps: Types.Modules.Extension.CovertOps;

  it("should mark all decorations in all virtual text editor as outdated", async () => {
    const event = buildOutdateDecorationsEventForUncoveredCodeRegionsVirtualTextEditorSpy();
    const waitForTwoIncrementedCallCountCalls = buildEventBasedSpyWaiterForTwoIncrementalCallCountCalls(event);
    covertOps = CovertOps.make({
      uncoveredCodeRegionsDocumentContentProvider: UncoveredCodeRegionsDocumentContentProvider.make(),
      uncoveredCodeRegionsVirtualTextEditorFactory: makeEventBasedSpyOfUncoveredCodeRegionsVirtualTextEditor(event),
      outputChannel: OutputChannel.make(vscode.window.createOutputChannel(Definitions.extensionId))
    });
    await OpenTwoSourceFilesAndExecuteCommandForEachOfThem();

    await vscode.workspace.getConfiguration(Definitions.extensionId).update("cmakeCommand", "cmakez");

    return waitForTwoIncrementedCallCountCalls.should.eventually.be.fulfilled;
  });

  after("Disposing of covert ops instance and reset default setting", async () => {
    covertOps.dispose();
    await vscode.workspace.getConfiguration(Definitions.extensionId).update("cmakeCommand", defaultSetting("cmakeCommand"));
  });
}

async function OpenTwoSourceFilesAndExecuteCommandForEachOfThem() {
  await showPartiallyCoveredSourceFileEditor("partiallyCoveredLib.cpp");
  await executeCommand();
  await showPartiallyCoveredSourceFileEditor("partiallyCoveredLib.hpp");
  await executeCommand();
}

function buildEventBasedSpyWaiterForTwoIncrementalCallCountCalls(event: SpyEventEmitterFor<Types.Modules.Extension.UncoveredCodeRegionsVirtualTextEditor>) {
  return new Promise<void>(resolve => {
    let callCount = 0;
    event.onIncrementedCallCount(count => {
      callCount += count;
      console.debug(`>>>debug: ${callCount} calls processed.`);

      if (callCount === 2)
        resolve();
    });
  });
}

async function executeCommandThenSwitchBetweenSourceFileAndUncoveredCodeRegionsVirtualTextEditor(covertOps: Types.Modules.Extension.CovertOps) {
  await executeCommand();
  const { cppFilePath } = await showPartiallyCoveredSourceFileEditor("partiallyCoveredLib.cpp");
  const uncoveredCodeRegionsVirtualTextEditor = <Types.Modules.Extension.UncoveredCodeRegionsVirtualTextEditor>covertOps.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath);
  await vscode.window.showTextDocument(uncoveredCodeRegionsVirtualTextEditor.document);
}

function buildRefreshDecorationsEventForUncoveredCodeRegionsVirtualTextEditorSpy() {
  return new SpyEventEmitterFor<Types.Modules.Extension.UncoveredCodeRegionsVirtualTextEditor>({
    eventType: "incrementedCallCount",
    member: "refreshDecorations"
  });
}

function buildOutdateDecorationsEventForUncoveredCodeRegionsVirtualTextEditorSpy() {
  return new SpyEventEmitterFor<Types.Modules.Extension.UncoveredCodeRegionsVirtualTextEditor>({
    eventType: "incrementedCallCount",
    member: "outdateDecorationsWith"
  });
}

function makeEventBasedSpyOfUncoveredCodeRegionsVirtualTextEditor(eventForSpy: SpyEventEmitterFor<Types.Modules.Extension.UncoveredCodeRegionsVirtualTextEditor>) {
  return (textEditor: Types.Modules.Extension.TextEditorLike) => {
    const uncoveredCodeRegionsVirtualTextEditor = UncoveredCodeRegionsVirtualTextEditor.make(textEditor);

    return buildEventBasedSpyForUncoveredCodeRegionsVirtualTextEditor({
      uncoveredCodeRegionsVirtualTextEditor,
      eventForSpy
    }).object;
  };
}

function buildCppAbsoluteFilePath(fileName: string) {
  const workspaceRootFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

  return path.join(<string>workspaceRootFolder, "src", "partiallyCovered", fileName);
}

async function showPartiallyCoveredSourceFileEditor(fileName: string) {
  const cppFilePath = buildCppAbsoluteFilePath(fileName);
  const editor = await vscode.window.showTextDocument(vscode.Uri.file(cppFilePath), { preserveFocus: false, preview: false });

  return { cppFilePath, currentEditor: editor };
}

async function executeCommand() {
  await vscode.commands.executeCommand(Strings.commandReportUncoveredCodeRegionsInFile);
}

async function executeCommandThreeTimes() {
  for (const _ of Array<never>(3))
    await executeCommand();
}

function doesCovertOpsHaveAnOutputChannel(covertOps: Types.Modules.Extension.CovertOps) {
  return ((_: Types.Adapters.Vscode.OutputChannelLikeWithLines): _ is Types.Adapters.Vscode.OutputChannelLikeWithLines => true)(covertOps.outputChannel);
}

function ensureCovertOpsCorrectStateRegardingContext(covertOps: Types.Modules.Extension.CovertOps, cppFilePath: string, currentEditor: vscode.TextEditor) {
  covertOps.uncoveredCodeRegionsVirtualTextEditors.size.should.be.equal(1);
  chai.assert.notStrictEqual(covertOps.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath), undefined);
  covertOps.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath)?.document.uri.scheme.should.be.equal(Definitions.extensionId);
  covertOps.uncoveredCodeRegionsVirtualTextEditors.get(cppFilePath)?.document.uri.fsPath.should.be.equal(currentEditor.document.uri.fsPath);
  vscode.window.activeTextEditor?.document.uri.scheme.should.be.equal(Definitions.extensionId);
}

function ensureVirtualEditorHasTheSameContentAsTheSourceFileEditor(currentEditor: vscode.TextEditor) {
  chai.assert.notStrictEqual(vscode.window.activeTextEditor, undefined);
  const virtualEditor = <vscode.TextEditor>vscode.window.activeTextEditor;
  virtualEditor.document.getText().should.be.equal(currentEditor.document.getText());
}

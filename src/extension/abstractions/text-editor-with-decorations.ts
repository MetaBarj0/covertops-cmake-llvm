import { TextEditor, TextEditorDecorationType, DecorationOptions, Range } from "vscode";

export type Decorations = {
  decorationType: TextEditorDecorationType,
  rangesOrOptions: ReadonlyArray<Range> | ReadonlyArray<DecorationOptions>
};

type WithDecorations = {
  get decorations(): Decorations | undefined;
};

export type TextEditorWithDecorations = TextEditor & WithDecorations;

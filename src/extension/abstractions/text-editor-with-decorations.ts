import { TextEditor, TextEditorDecorationType } from 'vscode';

type Decorations = {};

type WithDecorations = {
  get decorations(): Decorations | undefined;
};

export type TextEditorWithDecorations = TextEditor & WithDecorations;

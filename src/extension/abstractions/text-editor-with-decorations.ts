import { TextEditor } from 'vscode';

export type Decorations = {};

type WithDecorations = {
  get decorations(): Decorations | undefined;
};

export type TextEditorWithDecorations = TextEditor & WithDecorations;

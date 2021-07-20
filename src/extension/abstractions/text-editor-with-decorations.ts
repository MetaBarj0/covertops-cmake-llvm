import { TextEditor } from 'vscode';

type Decorations = {};

type WithDecorations = {
  get decorations(): Decorations;
};

export type TextEditorWithDecorations = TextEditor & WithDecorations;

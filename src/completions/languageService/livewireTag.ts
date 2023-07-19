import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
  LinesTextDocument,
  Position,
  SnippetString,
  workspace,
  TextEdit,
} from 'coc.nvim';

import { BladeCompletionItemDataType } from '../types';

export async function doCompletion(document: LinesTextDocument, position: Position) {
  const doc = workspace.getDocument(document.uri);
  if (!doc) return [];

  const canCompletionWordRange = doc.getWordRangeAtPosition(
    Position.create(position.line, position.character - 1),
    '<'
  );
  if (!canCompletionWordRange) return [];

  const canCompletionWord = document.getText(canCompletionWordRange) || '';
  if (!canCompletion(canCompletionWord)) return;

  let wordWithExtraChars: string | undefined = undefined;
  const wordWithExtraCharsRange = doc.getWordRangeAtPosition(
    Position.create(position.line, position.character - 1),
    ':'
  );
  if (wordWithExtraCharsRange) {
    wordWithExtraChars = document.getText(wordWithExtraCharsRange);
  }

  const adjustStartCharacter = wordWithExtraChars ? position.character - wordWithExtraChars.length : position.character;

  const edit: TextEdit = {
    range: {
      start: { line: position.line, character: adjustStartCharacter },
      end: position,
    },
    newText: new SnippetString('livewire:${1}').value,
  };

  const item: CompletionItem = {
    label: 'livewire',
    kind: CompletionItemKind.Text,
    textEdit: edit,
    insertTextFormat: InsertTextFormat.Snippet,
    command: { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' },
    data: <BladeCompletionItemDataType>{
      source: 'livewire-tag',
    },
  };

  return [item];
}

function canCompletion(word: string) {
  if (!word.startsWith('<')) {
    return false;
  }

  return true;
}

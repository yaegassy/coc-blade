import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
  LinesTextDocument,
  Position,
  SnippetString,
  workspace,
} from 'coc.nvim';

import { BladeCompletionItemDataType } from '../types';

export async function doCompletion(document: LinesTextDocument, position: Position) {
  const doc = workspace.getDocument(document.uri);
  if (!doc) return [];
  const wordRange = doc.getWordRangeAtPosition(Position.create(position.line, position.character - 1), '<');
  if (!wordRange) return [];
  const text = document.getText(wordRange) || '';
  if (!text) return [];

  if (!text.startsWith('<')) return [];

  const item: CompletionItem = {
    label: 'livewire',
    kind: CompletionItemKind.Text,
    insertText: new SnippetString('livewire:${1}').value,
    insertTextFormat: InsertTextFormat.Snippet,
    command: { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' },
    data: <BladeCompletionItemDataType>{
      source: 'livewire-tag',
    },
  };

  return [item];
}

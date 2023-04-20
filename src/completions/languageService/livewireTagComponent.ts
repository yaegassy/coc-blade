import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
  LinesTextDocument,
  Position,
  SnippetString,
  TextEdit,
  workspace,
} from 'coc.nvim';

import { BladeCompletionItemDataType } from '../types';
import { getAllComponentsWithProps } from '../util/livewireUtil';

export async function doCompletion(document: LinesTextDocument, position: Position) {
  const doc = workspace.getDocument(document.uri);

  const linePrefix = document.lineAt(position).text.slice(0, position.character);
  const match = /<livewire:([A-Za-z0-9_.-]*)$/g.exec(linePrefix);
  if (!match) {
    return [];
  }

  const wordRange = doc.getWordRangeAtPosition(Position.create(position.line, position.character - 1), ':');
  if (!wordRange) return [];

  const text = document.getText(wordRange) || '';
  if (!text) return null;

  const prefix = match[1] || '';
  const completionList = await getAllComponentsWithProps(prefix);

  const words = prefix.split(/\W+/g);
  const prefixLen = prefix.length - (words.length ? words[words.length - 1].length : 0);

  return completionList.map((c) => {
    let params = '';
    if (c.props && c.props.length) {
      for (let i = 0; i < c.props.length; i++) {
        if (c.props[i]) {
          params += ` :\${${i + 1}:${c.props[i]}=''}`;
        }
      }
    }

    const edit: TextEdit = {
      range: {
        start: { line: position.line, character: position.character - text.length },
        end: position,
      },
      newText: new SnippetString(`livewire:${c.name.slice(prefixLen)}${params}`).value,
    };

    const item: CompletionItem = {
      label: 'livewire:' + c.name,
      kind: CompletionItemKind.Method,
      insertTextFormat: InsertTextFormat.Snippet,
      textEdit: edit,
      data: <BladeCompletionItemDataType>{
        source: 'livewire-tag-component',
      },
    };

    return item;
  });
}

import {
  CompletionItem,
  CompletionItemKind,
  ExtensionContext,
  InsertTextFormat,
  LinesTextDocument,
  Position,
  TextEdit,
  workspace,
} from 'coc.nvim';

import fs from 'fs';

import { BladeCompletionItemDataType } from '../types';

export type SnippetsJsonType = {
  [key: string]: {
    description: string;
    prefix: string;
    body: string | string[];
  };
};

export async function doCompletion(
  _extensionContext: ExtensionContext,
  document: LinesTextDocument,
  position: Position,
  snippetsFilePaths: string[],
  excludeSnippetsKeys: string[]
) {
  const items: CompletionItem[] = [];

  const doc = workspace.getDocument(document.uri);
  if (!doc) return [];

  const wordRange = doc.getWordRangeAtPosition(Position.create(position.line, position.character - 1), ':<');
  if (!wordRange) return [];

  const text = document.getText(wordRange) || '';
  if (!text) return [];
  // MEMO: Cannot control correctly because multiple completionProvider are registered...
  //if (!text.match(/(b:|lv:|livewire:|Blade::).*$/)) return [];
  if (text.match(/(<livewire:).*$/)) return [];

  snippetsFilePaths.forEach((v) => {
    getSnippetsCompletionItems(v, text, position, excludeSnippetsKeys).then((vv) => items.push(...vv));
  });

  return items;
}

export async function doResolveCompletion(item: CompletionItem): Promise<CompletionItem> {
  if (item.data) {
    const itemData: BladeCompletionItemDataType = item.data;
    if (itemData.source === 'blade-snippets') {
      if (item.textEdit && itemData.snippetsText) {
        item.textEdit.newText = itemData.snippetsText;
      }
    }
  }

  return item;
}

async function getSnippetsCompletionItems(
  snippetsFilePath: string,
  text: string,
  position: Position,
  excludeSnippetsKeys: string[]
) {
  const items: CompletionItem[] = [];

  if (fs.existsSync(snippetsFilePath)) {
    const snippetsJsonText = fs.readFileSync(snippetsFilePath, 'utf8');
    const snippetsJson: SnippetsJsonType = JSON.parse(snippetsJsonText);
    if (snippetsJson) {
      Object.keys(snippetsJson).map((key) => {
        // Check exclude
        if (excludeSnippetsKeys.includes(snippetsJson[key].prefix)) return;

        let snippetsText: string;
        const body = snippetsJson[key].body;
        if (body instanceof Array) {
          snippetsText = body.join('\n');
        } else {
          snippetsText = body;
        }

        const edit: TextEdit = {
          range: {
            start: { line: position.line, character: position.character - text.length },
            end: position,
          },
          newText: snippetsJson[key].prefix,
        };

        // In this extention, "insertText" or "TextEdit" is handled by "resolveCompletionItem".
        // In "provideCompletionItems", if "insertText" or "TextEdit" contains only snippets data,
        // it will be empty when the candidate is selected.
        items.push({
          label: snippetsJson[key].prefix,
          kind: CompletionItemKind.Snippet,
          detail: snippetsJson[key].description,
          documentation: { kind: 'markdown', value: '```blade\n' + snippetsText + '\n```' },
          insertTextFormat: InsertTextFormat.Snippet,
          textEdit: edit,
          // The "snippetsText" that will eventually be added to the insertText
          // will be stored in the "data" key
          data: <BladeCompletionItemDataType>{
            source: 'blade-snippets',
            snippetsText: snippetsText,
          },
        });
      });
    }
  }

  return items;
}

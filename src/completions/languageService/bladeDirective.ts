import {
  CompletionItem,
  CompletionItemKind,
  ExtensionContext,
  LinesTextDocument,
  MarkupKind,
  Position,
  TextEdit,
  workspace,
} from 'coc.nvim';

import fs from 'fs';
import path from 'path';

import { BladeCompletionItemDataType } from '../types';

export type CompletionJsonType = {
  [key: string]: string;
};

export async function doCompletion(
  extensionContext: ExtensionContext,
  document: LinesTextDocument,
  position: Position,
  directiveJsonFilePaths: string[]
) {
  const items: CompletionItem[] = [];

  const doc = workspace.getDocument(document.uri);
  if (!doc) return [];

  const wordRange = doc.getWordRangeAtPosition(Position.create(position.line, position.character - 1), '@');
  if (!wordRange) return [];

  const text = document.getText(wordRange) || '';
  if (!text) return [];
  if (!text.startsWith('@')) return [];

  directiveJsonFilePaths.forEach(async (completionDataPath) => {
    const directiveItems = await getCompletionItems(extensionContext, completionDataPath, text, position);
    if (directiveItems) {
      items.push(...directiveItems);
    }
  });

  return items;
}

async function getCompletionItems(
  context: ExtensionContext,
  completionDataPath: string,
  text: string,
  position: Position
) {
  const completionList: CompletionItem[] = [];
  if (fs.existsSync(completionDataPath)) {
    const completionJsonText = fs.readFileSync(completionDataPath, 'utf8');
    const completionJson: CompletionJsonType = JSON.parse(completionJsonText);

    if (completionJson) {
      Object.keys(completionJson).map((key) => {
        const docDataPath = path.join(
          context.extensionPath,
          'data',
          'documantation',
          'blade',
          key.replace('@', '') + '.md'
        );

        let documentationText: string | undefined;
        try {
          documentationText = fs.readFileSync(docDataPath, 'utf8');
        } catch (e) {
          // noop
          documentationText = undefined;
        }

        const edit: TextEdit = {
          range: {
            start: { line: position.line, character: position.character - text.length },
            end: position,
          },
          newText: key,
        };

        completionList.push({
          label: key,
          kind: CompletionItemKind.Text,
          insertText: key,
          detail: completionJson[key],
          textEdit: edit,
          documentation: documentationText
            ? {
                kind: MarkupKind.Markdown,
                value: documentationText,
              }
            : undefined,
          data: <BladeCompletionItemDataType>{
            source: 'blade-directive',
          },
        });
      });
    }
  }

  return completionList;
}

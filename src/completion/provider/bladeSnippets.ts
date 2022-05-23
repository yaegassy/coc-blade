import {
  CancellationToken,
  CompletionContext,
  CompletionItem,
  CompletionItemKind,
  CompletionItemProvider,
  CompletionList,
  ExtensionContext,
  InsertTextFormat,
  OutputChannel,
  Position,
  TextDocument,
  TextEdit,
  workspace,
} from 'coc.nvim';

import path from 'path';
import fs from 'fs';
import { getConfigBladeCompletionExcludeSnippets } from '../../config';

type SnippetsJsonType = {
  [key: string]: {
    description: string;
    prefix: string;
    body: string | string[];
  };
};

export class BladeSnippetsCompletionProvider implements CompletionItemProvider {
  private _context: ExtensionContext;
  private _outputChannel: OutputChannel;
  private snippetsFilePaths: string[];
  private excludeSnippetsKeys: string[];

  constructor(context: ExtensionContext, outputChannel: OutputChannel) {
    this._context = context;
    this._outputChannel = outputChannel;
    this.snippetsFilePaths = [
      path.join(this._context.extensionPath, 'data', 'snippets', 'snippets.json'),
      path.join(this._context.extensionPath, 'data', 'snippets', 'helpers.json'),
      path.join(this._context.extensionPath, 'data', 'snippets', 'blade.json'),
      path.join(this._context.extensionPath, 'data', 'snippets', 'livewire.json'),
    ];
    this.excludeSnippetsKeys = getConfigBladeCompletionExcludeSnippets();
  }

  async getSnippetsCompletionItems(snippetsFilePath: string, text: string, position: Position) {
    const snippetsCompletionList: CompletionItem[] = [];
    if (fs.existsSync(snippetsFilePath)) {
      const snippetsJsonText = fs.readFileSync(snippetsFilePath, 'utf8');
      const snippetsJson: SnippetsJsonType = JSON.parse(snippetsJsonText);
      if (snippetsJson) {
        Object.keys(snippetsJson).map((key) => {
          // Check exclude
          if (this.excludeSnippetsKeys.includes(snippetsJson[key].prefix)) return;

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
          snippetsCompletionList.push({
            label: snippetsJson[key].prefix,
            kind: CompletionItemKind.Snippet,
            detail: snippetsJson[key].description,
            documentation: { kind: 'markdown', value: '```blade\n' + snippetsText + '\n```' },
            insertTextFormat: InsertTextFormat.Snippet,
            textEdit: edit,
            // The "snippetsText" that will eventually be added to the insertText
            // will be stored in the "data" key
            data: snippetsText,
          });
        });
      }
    }

    return snippetsCompletionList;
  }

  async provideCompletionItems(
    document: TextDocument,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    position: Position,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: CancellationToken,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: CompletionContext
  ): Promise<CompletionItem[] | CompletionList> {
    const doc = workspace.getDocument(document.uri);
    if (!doc) return [];

    const wordRange = doc.getWordRangeAtPosition(Position.create(position.line, position.character - 1), ':<');
    if (!wordRange) return [];

    const text = document.getText(wordRange) || '';
    if (!text) return [];
    // MEMO: Cannot control correctly because multiple completionProvider are registered...
    //if (!text.match(/(b:|lv:|livewire:|Blade::).*$/)) return [];
    if (text.match(/(<livewire:).*$/)) return [];

    const completionItemList: CompletionItem[] = [];
    this.snippetsFilePaths.forEach((v) => {
      this.getSnippetsCompletionItems(v, text, position).then((vv) => completionItemList.push(...vv));
    });
    return completionItemList;
  }

  async resolveCompletionItem(item: CompletionItem): Promise<CompletionItem> {
    if (item.textEdit) {
      item.textEdit.newText = item.data;
    }
    return item;
  }
}

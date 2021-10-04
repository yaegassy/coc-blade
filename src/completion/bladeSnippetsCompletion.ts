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
  workspace,
} from 'coc.nvim';

import path from 'path';
import fs from 'fs';

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
      path.join(this._context.extensionPath, 'snippets', 'snippets.json'),
      path.join(this._context.extensionPath, 'snippets', 'helpers.json'),
      path.join(this._context.extensionPath, 'snippets', 'blade.json'),
      path.join(this._context.extensionPath, 'snippets', 'livewire.json'),
    ];
    this.excludeSnippetsKeys = workspace.getConfiguration('blade').get<string[]>('completion.exclude', []);
  }

  async getSnippetsCompletionItems(snippetsFilePath: string) {
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

          // In this extention, "insertText" is handled by "resolveCompletionItem".
          // In "provideCompletionItems", if "insertText" contains only snippets data,
          // it will be empty when the candidate is selected.
          snippetsCompletionList.push({
            label: snippetsJson[key].prefix,
            kind: CompletionItemKind.Snippet,
            filterText: snippetsJson[key].prefix,
            detail: snippetsJson[key].description,
            documentation: snippetsText,
            insertTextFormat: InsertTextFormat.Snippet,
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
    const completionItemList: CompletionItem[] = [];
    this.snippetsFilePaths.forEach((v) => {
      this.getSnippetsCompletionItems(v).then((vv) => completionItemList.push(...vv));
    });
    return completionItemList;
  }

  async resolveCompletionItem(item: CompletionItem): Promise<CompletionItem> {
    if (item.kind === CompletionItemKind.Snippet) {
      item.insertText = item.data;
    }
    return item;
  }
}

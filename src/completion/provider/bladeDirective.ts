import {
  CancellationToken,
  CompletionContext,
  CompletionItem,
  CompletionItemKind,
  CompletionItemProvider,
  CompletionList,
  ExtensionContext,
  LinesTextDocument,
  Position,
  TextEdit,
  workspace,
} from 'coc.nvim';

import fs from 'fs';
import path from 'path';

type CompletionJsonType = {
  [key: string]: string;
};

export class BladeDirectiveCompletionProvider implements CompletionItemProvider {
  private _context: ExtensionContext;
  private directiveJsonPaths: string[];

  constructor(context: ExtensionContext) {
    this._context = context;
    this.directiveJsonPaths = [
      path.join(this._context.extensionPath, 'data', 'completion', 'blade-directive.json'),
      path.join(this._context.extensionPath, 'data', 'completion', 'livewire-directive.json'),
    ];
  }

  async getCompletionItems(completionDataPath: string, text: string, position: Position) {
    const completionList: CompletionItem[] = [];
    if (fs.existsSync(completionDataPath)) {
      const completionJsonText = fs.readFileSync(completionDataPath, 'utf8');
      const completionJson: CompletionJsonType = JSON.parse(completionJsonText);

      if (completionJson) {
        Object.keys(completionJson).map((key) => {
          const docDataPath = path.join(
            this._context.extensionPath,
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
            documentation: documentationText,
          });
        });
      }
    }

    return completionList;
  }

  async provideCompletionItems(
    //document: TextDocument,
    document: LinesTextDocument,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    position: Position,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: CancellationToken,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: CompletionContext
  ): Promise<CompletionItem[] | CompletionList> {
    const doc = workspace.getDocument(document.uri);
    if (!doc) return [];
    const wordRange = doc.getWordRangeAtPosition(Position.create(position.line, position.character - 1), '@');
    if (!wordRange) return [];

    const text = document.getText(wordRange) || '';
    if (!text) return [];
    if (!text.startsWith('@')) return [];

    const completionItemList: CompletionItem[] = [];
    this.directiveJsonPaths.forEach((v) => {
      this.getCompletionItems(v, text, position).then((vv) => completionItemList.push(...vv));
    });
    return completionItemList;
  }
}

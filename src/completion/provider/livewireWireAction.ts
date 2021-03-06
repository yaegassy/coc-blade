import {
  CancellationToken,
  CompletionContext,
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
  LinesTextDocument,
  Position,
  SnippetString,
  Uri,
} from 'coc.nvim';
import { getComponentActionsFromView, getComponentPropertiesFromView } from '../util/livewireUtil';

export class LivewireWireActionProvider {
  async provideCompletionItems(
    document: LinesTextDocument,
    position: Position,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: CancellationToken,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: CompletionContext
  ) {
    const linePrefix = document.lineAt(position).text.slice(0, position.character);
    const match = /(?:^|\s+)wire:(\w+)(?:\.(\w+))?(?:\.?([A-Za-z0-9_.]*))=(['"][A-Za-z0-9_.]*)?$/g.exec(linePrefix);
    if (!match || match.length < 4) {
      return [];
    }

    let attributes: string[] = [];
    switch (match[1]) {
      case 'click':
        attributes = (await getComponentActionsFromView(Uri.parse(document.uri).fsPath)) || [];
        break;

      case 'model':
        attributes = (await getComponentPropertiesFromView(Uri.parse(document.uri).fsPath)) || [];
        break;
    }

    if (!match[4] && !attributes.length) {
      return [];
    }

    const completionList = attributes.map((attribute) => {
      const item: CompletionItem = {
        label: attribute,
        kind: CompletionItemKind.Value,
        insertText: new SnippetString(`${match[4] ? '' : "'"}\${1:${attribute}}${match[4] ? '' : "'"}`).value,
        insertTextFormat: InsertTextFormat.Snippet,
      };

      return item;
    });

    return completionList;
  }
}

import {
  CancellationToken,
  CompletionContext,
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
  LinesTextDocument,
  Position,
  SnippetString,
} from 'coc.nvim';
import { getAllComponentsWithProps } from '../util/livewireUtil';

export class LivewireTagComponentProvider {
  async provideCompletionItems(
    document: LinesTextDocument,
    position: Position,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: CancellationToken,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: CompletionContext
  ) {
    const linePrefix = document.lineAt(position).text.slice(0, position.character);
    const match = /<livewire:([A-Za-z0-9_.-]*)$/g.exec(linePrefix);
    if (!match) {
      return [];
    }

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

      const item: CompletionItem = {
        label: 'livewire:' + c.name,
        kind: CompletionItemKind.Method,
        insertText: new SnippetString(`livewire:${c.name.slice(prefixLen)}${params}`).value,
        insertTextFormat: InsertTextFormat.Snippet,
      };

      return item;
    });
  }
}

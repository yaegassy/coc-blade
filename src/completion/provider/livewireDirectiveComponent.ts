import {
  LinesTextDocument,
  Position,
  CancellationToken,
  CompletionContext,
  CompletionItem,
  CompletionItemKind,
  SnippetString,
  InsertTextFormat,
} from 'coc.nvim';
import { getAllComponentsWithProps } from '../util/livewireUtil';

export class LivewireDirectiveComponentProvider {
  async provideCompletionItems(
    document: LinesTextDocument,
    position: Position,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: CancellationToken,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: CompletionContext
  ) {
    const linePrefix = document.lineAt(position).text.slice(0, position.character);

    const match = /@livewire\(([A-Za-z0-9_.-]*)$/g.exec(linePrefix);
    if (!match) {
      return [];
    }

    const prefix = match[1] || '';
    const completionList = await getAllComponentsWithProps(prefix);

    return completionList.map((c) => {
      let completeText = `'${c.name}'`;
      if (c.props && c.props.length) {
        const props: string[] = [];
        for (let i = 0; i < c.props.length; i++) {
          props.push(`'\${${i + 2}:${c.props[i]}}' => ''`);
        }
        completeText += `\${1:, [${props.join(', ')}]}`;
      }
      const item: CompletionItem = {
        label: `${c.name}`,
        kind: CompletionItemKind.Method,
        insertText: new SnippetString(completeText).value,
        insertTextFormat: InsertTextFormat.Snippet,
      };

      return item;
    });
  }
}

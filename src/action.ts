import {
  CodeAction,
  CodeActionContext,
  CodeActionProvider,
  Document,
  Position,
  Range,
  TextDocument,
  TextEdit,
  workspace,
} from 'coc.nvim';

export class BladeCodeActionProvider implements CodeActionProvider {
  constructor() {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext) {
    const doc = workspace.getDocument(document.uri);
    const codeActions: CodeAction[] = [];

    /** Add {{-- blade-formatter-disable-next-line --}} for this line */
    if (this.lineRange(range)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const line = doc.getline(range.start.line);

      const thisLineFullLength = doc.getline(range.start.line).length;
      const thisLineTrimLength = doc.getline(range.start.line).trim().length;
      const suppressLineLength = thisLineFullLength - thisLineTrimLength;

      let suppressLineNewText = '{{-- blade-formatter-disable-next-line --}}\n';
      if (suppressLineLength > 0) {
        const addIndentSpace = ' '.repeat(suppressLineLength);
        suppressLineNewText = '{{-- blade-formatter-disable-next-line --}}\n' + addIndentSpace;
      }

      const edit = TextEdit.insert(Position.create(range.start.line, suppressLineLength), suppressLineNewText);
      codeActions.push({
        title: 'Add "blade-formatter-disable-next-line" for this line',
        edit: {
          changes: {
            [doc.uri]: [edit],
          },
        },
      });
    }

    /** Add "blade-formatter-disable" for this line */
    if (this.lineRange(range)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const line = doc.getline(range.start.line);

      const thisLineFullLength = doc.getline(range.start.line).length;
      const thisLineTrimLength = doc.getline(range.start.line).trim().length;
      const suppressLineLength = thisLineFullLength - thisLineTrimLength;

      let suppressLineNewText = '{{-- blade-formatter-disable --}}\n';
      if (suppressLineLength > 0) {
        const addIndentSpace = ' '.repeat(suppressLineLength);
        suppressLineNewText = '{{-- blade-formatter-disable --}}\n' + addIndentSpace;
      }

      const edit = TextEdit.insert(Position.create(range.start.line, suppressLineLength), suppressLineNewText);
      codeActions.push({
        title: 'Add "blade-formatter-disable" for this line',
        edit: {
          changes: {
            [doc.uri]: [edit],
          },
        },
      });
    }

    /** Add {{-- blade-formatter-enable --}} for this line */
    if (this.lineRange(range)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const line = doc.getline(range.start.line);

      const thisLineFullLength = doc.getline(range.start.line).length;
      const thisLineTrimLength = doc.getline(range.start.line).trim().length;
      const suppressLineLength = thisLineFullLength - thisLineTrimLength;

      let suppressLineNewText = '{{-- blade-formatter-enable --}}\n';
      if (suppressLineLength > 0) {
        const addIndentSpace = ' '.repeat(suppressLineLength);
        suppressLineNewText = '{{-- blade-formatter-enable --}}\n' + addIndentSpace;
      }

      const edit = TextEdit.insert(Position.create(range.start.line, suppressLineLength), suppressLineNewText);
      codeActions.push({
        title: 'Add "blade-formatter-enable" for this line',
        edit: {
          changes: {
            [doc.uri]: [edit],
          },
        },
      });
    }

    /** Add {{-- blade-formatter-disable --}} for whole file */
    if (this.wholeRange(doc, range) || this.cursorRange(range)) {
      const pos = Position.create(0, 0);
      const edit = TextEdit.insert(pos, '{{-- blade-formatter-disable --}}\n');
      codeActions.push({
        title: 'Add "blade-formatter-disable" for whole file',

        edit: {
          changes: {
            [doc.uri]: [edit],
          },
        },
      });
    }

    return codeActions;
  }

  private wholeRange(doc: Document, range: Range): boolean {
    const whole = Range.create(0, 0, doc.lineCount, 0);
    return (
      whole.start.line === range.start.line &&
      whole.start.character === range.start.character &&
      whole.end.line === range.end.line &&
      whole.end.character === whole.end.character
    );
  }

  private lineRange(r: Range): boolean {
    return (
      (r.start.line + 1 === r.end.line && r.start.character === 0 && r.end.character === 0) ||
      (r.start.line === r.end.line && r.start.character === 0)
    );
  }

  private cursorRange(r: Range): boolean {
    return r.start.line === r.end.line && r.start.character === r.end.character;
  }
}

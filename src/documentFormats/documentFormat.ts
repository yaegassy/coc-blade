import {
  Disposable,
  DocumentFormattingEditProvider,
  DocumentSelector,
  ExtensionContext,
  languages,
  OutputChannel,
  Range,
  TextDocument,
  TextEdit,
} from 'coc.nvim';

import { fullDocumentRange } from '../common';
import { getConfigBladeFormatterEnable } from '../config';
import { doFormat } from '../engines/bladeFormatter';

let formatterHandler: undefined | Disposable;

function disposeHandlers(): void {
  if (formatterHandler) {
    formatterHandler.dispose();
  }
  formatterHandler = undefined;
}

export function register(context: ExtensionContext, outputChannel: OutputChannel) {
  const documentSelector: DocumentSelector = [{ language: 'blade', scheme: 'file' }];
  if (getConfigBladeFormatterEnable()) {
    const editProvider = new BladeFormatterDocumantFormattingEditProvider(context, outputChannel);
    const priority = 1;

    function registerFormatter(): void {
      disposeHandlers();
      formatterHandler = languages.registerDocumentFormatProvider(documentSelector, editProvider, priority);
    }
    registerFormatter();
  }
}

class BladeFormatterDocumantFormattingEditProvider implements DocumentFormattingEditProvider {
  public _context: ExtensionContext;
  public _outputChannel: OutputChannel;

  constructor(context: ExtensionContext, outputChannel: OutputChannel) {
    this._context = context;
    this._outputChannel = outputChannel;
  }

  public provideDocumentFormattingEdits(document: TextDocument): Promise<TextEdit[]> {
    return this._provideEdits(document, undefined);
  }

  private async _provideEdits(document: TextDocument, range?: Range): Promise<TextEdit[]> {
    const code = await doFormat(this._context, this._outputChannel, document, range);
    if (!range) {
      range = fullDocumentRange(document);
    }
    return [TextEdit.replace(range, code)];
  }
}

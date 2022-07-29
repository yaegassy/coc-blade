import { commands, ExtensionContext, OutputChannel, TextEdit, workspace } from 'coc.nvim';

import { fullDocumentRange } from '../common';
import { getConfigBladeFormatterEnable } from '../config';
import { doFormat } from '../engines/bladeFormatter';

export async function register(context: ExtensionContext, outputChannel: OutputChannel) {
  if (getConfigBladeFormatterEnable()) {
    context.subscriptions.push(
      commands.registerCommand('blade.bladeFormatter.run', async () => {
        const doc = await workspace.document;

        const code = await doFormat(context, outputChannel, doc.textDocument, undefined);
        const edits = [TextEdit.replace(fullDocumentRange(doc.textDocument), code)];
        if (edits) {
          await doc.applyEdits(edits);
        }
      })
    );
  }
}

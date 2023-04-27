import { commands, ExtensionContext, Location, OutputChannel, Position, Range, Uri, workspace } from 'coc.nvim';

import { BladeDocument } from 'stillat-blade-parser/out/document/bladeDocument';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BladeEchoNode, DirectiveNode } from 'stillat-blade-parser/out/nodes/nodes';

type BladeReferenceType = {
  startLine: number;
  startChar: number;
  endLine: number;
  endChar: number;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function register(context: ExtensionContext, _outputChannel: OutputChannel) {
  context.subscriptions.push(
    commands.registerCommand('blade.showReferences', async () => {
      const { document, position } = await workspace.getCurrentState();
      if (document.languageId !== 'blade') return;

      const refs: BladeReferenceType[] = [];
      const text = document.getText();
      const parsedBladeDoc = BladeDocument.fromText(text);

      parsedBladeDoc.getAllNodes().forEach((node) => {
        if (node instanceof DirectiveNode) {
          if (node.namePosition) {
            if (node.namePosition.start && node.namePosition.end) {
              refs.push({
                startLine: node.namePosition.start.line - 1,
                startChar: node.namePosition.start.char - 1,
                endLine: node.namePosition.end.line - 1,
                endChar: node.namePosition.end.char,
              });
            }
          }
        }

        if (node instanceof BladeEchoNode) {
          if (node.startPosition && node.endPosition) {
            let fixStartPosChar = 1;
            if (node.sourceContent.startsWith('{{')) {
              fixStartPosChar = 2;
            }
            refs.push({
              startLine: node.startPosition.line - 1,
              startChar: node.startPosition.char - fixStartPosChar,
              endLine: node.endPosition.line - 1,
              endChar: node.endPosition.char,
            });
          }
        }

        //if (node instanceof BladeComponentNode) {
        //  if (node.startPosition && node.endPosition) {
        //    refs.push({
        //      startLine: node.startPosition.line - 1,
        //      startChar: node.startPosition.char - 1,
        //      endLine: node.endPosition.line - 1,
        //      endChar: node.endPosition.char,
        //    });
        //  }
        //}
      });

      commands.executeCommand(
        'editor.action.showReferences',
        Uri.parse(document.uri),
        position,
        refs.map((ref) =>
          Location.create(
            document.uri,
            Range.create(Position.create(ref.startLine, ref.startChar), Position.create(ref.endLine, ref.endChar))
          )
        )
      );
    })
  );
}

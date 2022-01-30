import {
  DocumentFormattingEditProvider,
  Range,
  TextDocument,
  TextEdit,
  Uri,
  window,
  workspace,
  ExtensionContext,
  OutputChannel,
} from 'coc.nvim';

import fs from 'fs';
import path from 'path';
import ignore from 'ignore';
import { createSyncFn } from 'synckit';
import { FormatterOption, WrapAttributes } from 'blade-formatter';

export async function doFormat(
  context: ExtensionContext,
  outputChannel: OutputChannel,
  document: TextDocument,
  range?: Range
): Promise<string> {
  const fileName = Uri.parse(document.uri).fsPath;
  const originalText = document.getText(range);

  if (document.languageId !== 'blade') {
    window.showErrorMessage('blade-formatter cannot run, not a blade file');
    return originalText;
  }

  const extConfig = workspace.getConfiguration('blade.bladeFormatter');

  const defaultIndentSize = 4;
  const defaultWrapLineLength = 120;
  const defaultWrapAttributes: WrapAttributes = 'auto';

  const formatIndentSize = extConfig.get('optIndentSize', defaultIndentSize);
  const formatWrapLineLength = extConfig.get('optWrapLineLength', defaultWrapLineLength);
  const formatWrapAttributes = extConfig.get('optWrapAttributes', defaultWrapAttributes);

  let toolPath = extConfig.get('toolPath', '');
  if (!toolPath) {
    if (fs.existsSync(context.asAbsolutePath('node_modules/blade-formatter/bin/blade-formatter'))) {
      toolPath = context.asAbsolutePath('node_modules/blade-formatter/bin/blade-formatter');
    } else {
      window.showErrorMessage('Unable to find the blade-formatter.');
      return originalText;
    }
  } else {
    if (!fs.existsSync(toolPath)) {
      window.showErrorMessage('Unable to find the blade-formatter (user setting).');
      return originalText;
    }
  }

  const args: FormatterOption = {
    indentSize: formatIndentSize,
    wrapAttributes: formatWrapAttributes,
    wrapLineLength: formatWrapLineLength,
  };

  const cwd = Uri.file(workspace.root).fsPath;
  const opts = { cwd };

  // ---- Output the command to be executed to channel log. ----
  outputChannel.appendLine(`${'#'.repeat(10)} blade-formatter\n`);
  outputChannel.appendLine(`Cwd: ${opts.cwd}`);
  outputChannel.appendLine(`Args: ${JSON.stringify(args)}`);
  outputChannel.appendLine(`File: ${fileName}`);
  outputChannel.appendLine(`Run: ${toolPath} ${JSON.stringify(args)}`);

  const isIgnoreFile = shouldIgnore(fileName, outputChannel);
  if (isIgnoreFile) {
    window.showWarningMessage('.bladeignore matched file.');
    return originalText;
  }

  return new Promise((resolve, reject) => {
    const syncFn = createSyncFn(require.resolve('../src/worker'));
    let newText = '';

    try {
      // try formatting in worker thread
      newText = syncFn(originalText, args);
      outputChannel.appendLine(`\n==== STDOUT ===\n`);
      outputChannel.appendLine(`${newText}`);
      outputChannel.appendLine(`== success ==`);
      resolve(newText);
    } catch (error: any) {
      // show error if something goes wrong while formatting
      window.showWarningMessage(`Formatting failed due to an error in the template.\n${error.message}`);
      outputChannel.appendLine(`\n==== ERROR ===\n`);
      outputChannel.appendLine(`${error.message}`);
      outputChannel.appendLine(`\n==== originalText: ===\n`);
      outputChannel.appendLine(`${originalText}`);
      reject(error)
    }
  });
}

export function fullDocumentRange(document: TextDocument): Range {
  const lastLineId = document.lineCount - 1;
  const doc = workspace.getDocument(document.uri);

  return Range.create({ character: 0, line: 0 }, { character: doc.getline(lastLineId).length, line: lastLineId });
}

class BladeFormattingEditProvider implements DocumentFormattingEditProvider {
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

function shouldIgnore(filepath: string, outputChannel: OutputChannel): boolean {
  const workspaceRootDir = Uri.file(workspace.root).fsPath;

  const ignoreFilename = '.bladeignore';
  const ignoreFilePath = path.join(workspaceRootDir, ignoreFilename);

  if (fs.existsSync(ignoreFilePath)) {
    const ignoreFileContent = fs.readFileSync(ignoreFilePath, 'utf-8');
    const ig = ignore().add(ignoreFileContent);

    try {
      const isMatch = ig.ignores(path.relative(workspaceRootDir, filepath));
      if (isMatch) outputChannel.appendLine(`IGNORE: matched ${filepath}\n`);
      return isMatch;
    } catch (err) {
      return false;
    }
  }

  return false;
}

export default BladeFormattingEditProvider;

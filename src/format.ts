import {
  DocumentFormattingEditProvider,
  ExtensionContext,
  OutputChannel,
  Range,
  TextDocument,
  TextEdit,
  Uri,
  window,
  workspace,
} from 'coc.nvim';

import { FormatterOption } from 'blade-formatter';
import fs from 'fs';
import ignore from 'ignore';
import path from 'path';
import { createSyncFn } from 'synckit';
import {
  getConfigBladeFormatterOptIndentSize,
  getConfigBladeFormatterOptSortTailwindcssClasses,
  getConfigBladeFormatterOptWrapAttributes,
  getConfigBladeFormatterOptWrapLineLength,
} from './config';

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

  const formatIndentSize = getConfigBladeFormatterOptIndentSize();
  const formatWrapLineLength = getConfigBladeFormatterOptWrapLineLength();
  const formatWrapAttributes = getConfigBladeFormatterOptWrapAttributes();
  const formatSortTailwindcssClasses = getConfigBladeFormatterOptSortTailwindcssClasses();

  const options: FormatterOption = {
    indentSize: formatIndentSize,
    wrapAttributes: formatWrapAttributes,
    wrapLineLength: formatWrapLineLength,
    // MEMO: type is ----> sortTailwindcssClasses?: true;
    sortTailwindcssClasses: formatSortTailwindcssClasses ? formatSortTailwindcssClasses : undefined,
  };

  const cwd = Uri.file(workspace.root).fsPath;
  const opts = { cwd };

  // ---- Output the command to be executed to channel log. ----
  outputChannel.appendLine(`${'#'.repeat(10)} blade-formatter\n`);
  outputChannel.appendLine(`Cwd: ${opts.cwd}`);
  outputChannel.appendLine(`Option: ${JSON.stringify(options)}`);
  outputChannel.appendLine(`File: ${fileName}`);

  const isIgnoreFile = shouldIgnore(fileName, outputChannel);
  if (isIgnoreFile) {
    window.showWarningMessage('.bladeignore matched file.');
    return originalText;
  }

  return new Promise((resolve, reject) => {
    const workerPath = path.join(context.extensionPath, 'worker', 'index.js');
    const syncFn = createSyncFn(workerPath);
    let newText = '';

    try {
      // try formatting in worker thread
      newText = syncFn(originalText, options);
      outputChannel.appendLine(`\n==== OUTPUT ===\n`);
      outputChannel.appendLine(`${newText}`);
      outputChannel.appendLine(`== success ==\n`);
      resolve(newText);
    } catch (error: any) {
      // show error if something goes wrong while formatting
      window.showWarningMessage(`Formatting failed due to an error in the template.\n${error.message}`);
      outputChannel.appendLine(`\n==== ERROR ===\n`);
      outputChannel.appendLine(`${error.message}`);
      outputChannel.appendLine(`\n==== originalText: ===\n`);
      outputChannel.appendLine(`${originalText}`);
      reject(error);
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

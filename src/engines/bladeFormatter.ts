import { ExtensionContext, OutputChannel, Range, TextDocument, Uri, window, workspace } from 'coc.nvim';

import { FormatterOption } from 'blade-formatter';

import fs from 'fs';
import ignore from 'ignore';
import path from 'path';
import { createSyncFn } from 'synckit';
import {
  getConfigBladeFormatterOptEndWithNewLine,
  getConfigBladeFormatterOptIndentSize,
  getConfigBladeFormatterOptNoMultipleEmptyLines,
  getConfigBladeFormatterOptSortHtmlAttributes,
  getConfigBladeFormatterOptSortTailwindcssClasses,
  getConfigBladeFormatterOptUseTabs,
  getConfigBladeFormatterOptWrapAttributes,
  getConfigBladeFormatterOptWrapLineLength,
} from '../config';

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
  const formatSortHtmlAttributes = getConfigBladeFormatterOptSortHtmlAttributes();
  const formatNoMultipleEmptyLines = getConfigBladeFormatterOptNoMultipleEmptyLines();
  const formatEndWithNewLine = getConfigBladeFormatterOptEndWithNewLine();
  const formatUseTabs = getConfigBladeFormatterOptUseTabs();

  const options: FormatterOption = {
    indentSize: formatIndentSize,
    wrapAttributes: formatWrapAttributes,
    wrapLineLength: formatWrapLineLength,
    endWithNewline: formatEndWithNewLine,
    useTabs: formatUseTabs,
    // MEMO: type is ----> sortTailwindcssClasses?: true;
    sortTailwindcssClasses: formatSortTailwindcssClasses ? formatSortTailwindcssClasses : undefined,
    sortHtmlAttributes: formatSortHtmlAttributes,
    noMultipleEmptyLines: formatNoMultipleEmptyLines,
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

  return new Promise((resolve) => {
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
      window.showWarningMessage(`[blade-formatter]: ${error.message}`);
      outputChannel.appendLine(`\n==== ERROR ===\n`);
      outputChannel.appendLine(`${error.message}`);
      outputChannel.appendLine(`\n==== originalText: ===\n`);
      outputChannel.appendLine(`${originalText}`);
      resolve(originalText);
    }
  });
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

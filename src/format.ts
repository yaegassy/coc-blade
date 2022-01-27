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

import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import ignore from 'ignore';

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

  const formatIndentSize = extConfig.get('optIndentSize', null);
  const formatWrapLineLength = extConfig.get('optWrapLineLength', null);
  const formatWrapAttributes = extConfig.get('optWrapAttributes', null);

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

  const args: string[] = [];
  const cwd = Uri.file(workspace.root).fsPath;
  const opts = { cwd, shell: true };

  if (formatIndentSize) args.push(`--indent-size ${formatIndentSize}`);
  if (formatWrapLineLength) args.push(`--wrap-line-length ${formatWrapLineLength}`);
  if (formatWrapAttributes) args.push(`--wrap-attributes ${formatWrapAttributes}`);

  args.push('--stdin');

  // ---- Output the command to be executed to channel log. ----
  outputChannel.appendLine(`${'#'.repeat(10)} blade-formatter\n`);
  outputChannel.appendLine(`Cwd: ${opts.cwd}`);
  outputChannel.appendLine(`Args: ${args.join(' ')}`);
  outputChannel.appendLine(`File: ${fileName}`);
  outputChannel.appendLine(`Run: ${toolPath} ${args.join(' ')}`);

  const isIgnoreFile = shouldIgnore(fileName, outputChannel);
  if (isIgnoreFile) {
    window.showWarningMessage('.bladeignore matched file.');
    return originalText;
  }

  return new Promise((resolve) => {
    let newText = '';
    let isSuccess = false;
    const cps = cp.spawn(toolPath, args, opts);

    cps.on('error', (err: Error) => {
      outputChannel.appendLine(`\n==== ERROR ===\n`);
      outputChannel.appendLine(`${err}`);
      return;
    });

    if (cps.pid) {
      cps.stdin.write(originalText);
      cps.stdin.end();

      cps.stderr.on('data', (data: Buffer) => {
        outputChannel.appendLine(`\n==== STDERR ===\n`);
        outputChannel.appendLine(`${data}`);

        // rollback
        window.showWarningMessage(`Formatting failed due to an error in the template.`);
        resolve(originalText);
      });

      cps.stdout.on('data', (data: Buffer) => {
        outputChannel.appendLine(`\n==== STDOUT (data) ===\n`);
        isSuccess = isSuccessFormat(data.toString());
        outputChannel.appendLine(`== success ==: ${isSuccess}`);
        if (isSuccess) {
          newText = newText + data.toString();
        } else {
          // rollback
          window.showWarningMessage(`Formatting failed due to an error in the template.`);
          resolve(originalText);
        }
      });

      cps.stdout.on('close', () => {
        if (isSuccess) {
          outputChannel.appendLine(`\n==== STDOUT (close) ===\n`);
          outputChannel.appendLine(`${newText}`);
          // auto-fixed
          resolve(newText);
        } else {
          // rollback
          window.showWarningMessage(`Formatting failed due to an error in the template.`);
          resolve(originalText);
        }
      });
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

function isSuccessFormat(s: string) {
  let flag = true;
  const lines = s.split('\n');
  const p = /^SyntaxError:\s.*$/;

  for (const v of lines) {
    const m = v.match(p);
    if (m) {
      flag = false;
    }
  }

  return flag;
}

export default BladeFormattingEditProvider;

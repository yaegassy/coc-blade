import {
  DiagnosticCollection,
  DiagnosticSeverity,
  languages,
  Position,
  Range,
  TextDocument,
  workspace,
  OutputChannel,
  Uri,
} from 'coc.nvim';

import cp from 'child_process';

export class BladelinterLintEngine {
  private collection: DiagnosticCollection;
  private outputChannel: OutputChannel;

  constructor(outputChannel: OutputChannel) {
    this.collection = languages.createDiagnosticCollection('bladeLinter');
    this.outputChannel = outputChannel;
  }

  public async lint(textDocument: TextDocument): Promise<void> {
    if (textDocument.languageId !== 'blade') return;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const filePath = Uri.parse(textDocument.uri).fsPath;
    const args: string[] = [];
    const cwd = Uri.file(workspace.root).fsPath;
    // Use shell
    const opts = { cwd, shell: true };

    args.push('artisan');
    args.push('blade:lint');

    this.outputChannel.appendLine(`${'#'.repeat(10)} bladeLinter\n`);
    this.outputChannel.appendLine(`Cwd: ${opts.cwd}`);
    this.outputChannel.appendLine(`Run: php ${args.join(' ')} ${filePath}`);
    this.outputChannel.appendLine(`Args: ${args.join(' ')}`);
    this.outputChannel.appendLine(`File: ${filePath}`);
    this.outputChannel.appendLine(``);

    this.collection.set(textDocument.uri);

    return new Promise(function (resolve) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      cp.execFile('php', [...args, filePath], opts, function (error, stdout, stderr) {
        // MEMO: The current "blade-linter" seems to always return Error
        //if (error) {
        //  self.outputChannel.appendLine(`ERROR: ${error}`);
        //  // return;
        //}

        // MEMO: debug
        //if (stderr) {
        //  self.outputChannel.appendLine(`STDERR: ${stderr}`);
        //}

        if (stdout) {
          self.outputChannel.appendLine(`STDOUT: ${stdout}`);

          const match = stdout.match(/^.*:\s*(.*)\sin\s.*\son\sline\s(\d)/);

          let msg = '';
          // Initialize as line 1.
          // There may be no line number in the error message.
          let line = 1;

          // type guard
          if (match) {
            msg = match[1];
            line = parseInt(match[2]);
          } else {
            msg = 'There is a problem running larvel-blade-linter';
          }

          // position is "real line" - 1
          const startPosition = Position.create(line - 1, 0);
          const endPosition = Position.create(line - 1, 0);

          const diagnostic = {
            range: Range.create(startPosition, endPosition),
            message: msg,
            severity: DiagnosticSeverity.Error,
            source: 'bladeLinter',
            relatedInformation: [],
          };
          self.collection.set(textDocument.uri, [diagnostic]);
        }

        resolve();
      });
    });
  }
}

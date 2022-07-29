import {
  Diagnostic,
  DiagnosticCollection,
  DiagnosticSeverity,
  ExtensionContext,
  languages,
  OutputChannel,
  Position,
  Range,
  TextDocument,
  workspace,
} from 'coc.nvim';

import { BladeDocument } from 'stillat-blade-parser/out/document/bladeDocument';
import { ParserOptions } from 'stillat-blade-parser/out/parser/parserOptions';

import {
  getConfigBladeParserLintEnable,
  getConfigBladeParserLintDebug,
  getConfigBladeParserLintOptCustomIfs,
  getConfigBladeParserLintOptDirectives,
  getConfigBladeParserLintOptIgnoreDirectives,
} from '../config';

export async function register(context: ExtensionContext, outputChannel: OutputChannel) {
  if (getConfigBladeParserLintEnable()) {
    const engine = new BladeParserLintEngine(outputChannel);

    // onOpen
    workspace.documents.map(async (doc) => {
      await engine.lint(doc.textDocument);
    });
    workspace.onDidOpenTextDocument(
      async (e) => {
        await engine.lint(e);
      },
      null,
      context.subscriptions
    );

    // onChange
    workspace.onDidChangeTextDocument(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async (_e) => {
        const doc = await workspace.document;
        await engine.lint(doc.textDocument);
      },
      null,
      context.subscriptions
    );

    // onSave
    workspace.onDidSaveTextDocument(
      async (e) => {
        await engine.lint(e);
      },
      null,
      context.subscriptions
    );
  }
}

class BladeParserLintEngine {
  private collection: DiagnosticCollection;
  private outputChannel: OutputChannel;

  constructor(outputChannel: OutputChannel) {
    this.collection = languages.createDiagnosticCollection('bladeParser');
    this.outputChannel = outputChannel;
  }

  public async lint(textDocument: TextDocument): Promise<void> {
    if (textDocument.languageId !== 'blade') return;

    const diagnostics: Diagnostic[] = [];
    const content = textDocument.getText();

    const parserDocument = new BladeDocument();
    const parserOptions: ParserOptions = {
      customIfs: getConfigBladeParserLintOptCustomIfs(),
      directives: getConfigBladeParserLintOptDirectives(),
      ignoreDirectives: getConfigBladeParserLintOptIgnoreDirectives(),
    };

    parserDocument.getParser().withParserOptions(parserOptions);

    try {
      const res = parserDocument.loadString(content);

      res.errors.all().forEach((e) => {
        // channel logging
        if (getConfigBladeParserLintDebug()) {
          this.outputChannel.appendLine(`${'#'.repeat(10)} bladeParser\n`);
          this.outputChannel.appendLine(`errorCode: ${e.errorCode}`);
          this.outputChannel.appendLine(`level: ${e.level}`);
          this.outputChannel.appendLine(`message: ${e.message}`);
          this.outputChannel.appendLine(`startPosition: ${JSON.stringify(e.node?.startPosition)}`);
          this.outputChannel.appendLine(`endPosition: ${JSON.stringify(e.node?.endPosition)}\n`);
        }

        const message = e.message;
        const level = e.level;
        const severity = this.convertBladeErrorLevelToDiagnosticsSeverity(level);
        const errorCode = e.errorCode;

        let startPosition: Position | undefined;
        let endPosition: Position | undefined;
        if (e.node && e.node.startPosition && e.node.endPosition) {
          // MEMO:  The startPostion.char of this parser is adjusted by -1.
          startPosition = Position.create(e.node.startPosition.line - 1, e.node.startPosition.char - 1);
          // MEMO: The endPostiion of this parser is not very suitable for the linter, so we use startPostiion.
          endPosition = Position.create(e.node.startPosition.line - 1, e.node.startPosition.char);
        }

        if (startPosition && endPosition) {
          const diagnostic: Diagnostic = {
            source: 'bladeParser',
            code: errorCode,
            range: Range.create(startPosition, endPosition),
            message,
            severity,
            relatedInformation: [],
          };

          diagnostics.push(diagnostic);
        }
      });
    } catch (e) {
      this.collection.set(textDocument.uri, null);
    }

    this.collection.set(textDocument.uri, diagnostics);
  }

  private convertBladeErrorLevelToDiagnosticsSeverity(level: number) {
    switch (level) {
      case 0:
        return DiagnosticSeverity.Error;
      case 1:
        return DiagnosticSeverity.Warning;
      default:
        return DiagnosticSeverity.Error;
    }
  }
}

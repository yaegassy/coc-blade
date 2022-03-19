import {
  commands,
  Disposable,
  DocumentSelector,
  ExtensionContext,
  languages,
  TextEdit,
  window,
  workspace,
} from 'coc.nvim';

import fs from 'fs';
import path from 'path';

import { BladeHoverProvider } from './hover/hover';
import { BladeSnippetsCompletionProvider } from './completion/provider/bladeSnippets';
import { BladeDirectiveCompletionProvider } from './completion/provider/bladeDirective';
import { BladelinterLintEngine } from './lint';
import BladeFormattingEditProvider, { doFormat, fullDocumentRange } from './format';
import BladeDefinitionProvider from './definition';
import { BladeCodeActionProvider } from './action';

let formatterHandler: undefined | Disposable;

function disposeHandlers(): void {
  if (formatterHandler) {
    formatterHandler.dispose();
  }
  formatterHandler = undefined;
}

export async function activate(context: ExtensionContext): Promise<void> {
  const extConfig = workspace.getConfiguration('blade');
  const isEnable = extConfig.get<boolean>('enable', true);
  if (!isEnable) return;

  const outputChannel = window.createOutputChannel('blade');
  const { subscriptions } = context;

  const extensionStoragePath = context.storagePath;
  if (!fs.existsSync(extensionStoragePath)) {
    fs.mkdirSync(extensionStoragePath);
  }

  const languageSelector: DocumentSelector = [{ language: 'blade', scheme: 'file' }];

  // blade.showOutput command
  context.subscriptions.push(
    commands.registerCommand('blade.showOutput', () => {
      if (outputChannel) {
        outputChannel.show();
      }
    })
  );

  //
  // format
  //
  const isEnableBladeFormatter = extConfig.get<boolean>('bladeFormatter.enable', true);
  if (isEnableBladeFormatter) {
    const editProvider = new BladeFormattingEditProvider(context, outputChannel);
    const priority = 1;

    function registerFormatter(): void {
      disposeHandlers();
      formatterHandler = languages.registerDocumentFormatProvider(languageSelector, editProvider, priority);
    }
    registerFormatter();

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

  //
  // lint
  //
  const isEnableBladeLinter = extConfig.get<boolean>('bladeLinter.enable', true);
  if (isEnableBladeLinter) {
    if (
      fs.existsSync(path.join(workspace.root, 'artisan')) &&
      fs.existsSync(path.join(workspace.root, 'vendor', 'bdelespierre', 'laravel-blade-linter'))
    ) {
      const engine = new BladelinterLintEngine(outputChannel);

      // onOpen
      workspace.documents.map(async (doc) => {
        await engine.lint(doc.textDocument);
      });
      workspace.onDidOpenTextDocument(
        async (e) => {
          await engine.lint(e);
        },
        null,
        subscriptions
      );

      // onSave
      workspace.onDidSaveTextDocument(
        async (e) => {
          await engine.lint(e);
        },
        null,
        subscriptions
      );
    }
  }

  //
  // completion
  //
  const isEnableCompletion = extConfig.get<boolean>('completion.enable', true);
  if (isEnableCompletion) {
    const { document } = await workspace.getCurrentState();
    const indentexpr = await (await workspace.nvim.buffer).getOption('indentexpr');
    if (document.languageId === 'blade') {
      try {
        workspace.registerAutocmd({
          event: 'FileType',
          pattern: 'blade',
          request: true,
          callback: async () => {
            await workspace.nvim.command('setlocal iskeyword+=:');
            await workspace.nvim.command('setlocal iskeyword+=-');
          },
        });

        workspace.registerAutocmd({
          event: 'InsertEnter',
          pattern: '*.blade.php',
          request: true,
          callback: async () => {
            await workspace.nvim.command('setlocal indentexpr=');
          },
        });

        workspace.registerAutocmd({
          event: 'InsertLeave',
          pattern: '*.blade.php',
          request: true,
          callback: async () => {
            await workspace.nvim.command(`setlocal indentexpr=${indentexpr}`);
          },
        });
      } catch {
        // noop
      }
    }

    context.subscriptions.push(
      languages.registerCompletionItemProvider(
        'blade-snippets',
        'blade',
        ['blade'],
        new BladeSnippetsCompletionProvider(context, outputChannel)
      )
    );

    context.subscriptions.push(
      languages.registerCompletionItemProvider(
        'blade-directive',
        'blade',
        ['blade'],
        new BladeDirectiveCompletionProvider(context),
        ['@']
      )
    );
  }

  //
  // hover
  //
  context.subscriptions.push(languages.registerHoverProvider(languageSelector, new BladeHoverProvider(context)));

  //
  // definition
  //
  context.subscriptions.push(languages.registerDefinitionProvider(languageSelector, new BladeDefinitionProvider()));

  //
  // code action
  //
  const codeActionProvider = new BladeCodeActionProvider();
  context.subscriptions.push(languages.registerCodeActionProvider(languageSelector, codeActionProvider, 'blade'));
}

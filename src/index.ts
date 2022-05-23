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

import {
  getConfigBladeCompletionEnable,
  getConfigBladeCompletionEnableDirective,
  getConfigBladeCompletionEnableLivewireDirectiveComponent,
  getConfigBladeCompletionEnableLivewireTag,
  getConfigBladeCompletionEnableLivewireWire,
  getConfigBladeCompletionEnableSnippets,
  getConfigBladeEnable,
  getConfigBladeFormatterEnable,
  getConfigBladeLinterEnable,
} from './config';

import { BladeHoverProvider } from './hover/hover';
import { BladelinterLintEngine } from './lint';
import BladeFormattingEditProvider, { doFormat, fullDocumentRange } from './format';
import BladeDefinitionProvider from './definition';
import { BladeCodeActionProvider } from './action';
import { BladeSnippetsCompletionProvider } from './completion/provider/bladeSnippets';
import { BladeDirectiveCompletionProvider } from './completion/provider/bladeDirective';
import { LivewireTagProvider } from './completion/provider/livewireTag';
import { LivewireWireProvider } from './completion/provider/livewireWire';
import { LivewireDirectiveComponentProvider } from './completion/provider/livewireDirectiveComponent';
import { LivewireTagComponentProvider } from './completion/provider/livewireTagComponent';
import { LivewireWireActionProvider } from './completion/provider/livewireWireAction';
import { LivewireWireEventProvider } from './completion/provider/livewireWireEvent';

let formatterHandler: undefined | Disposable;

function disposeHandlers(): void {
  if (formatterHandler) {
    formatterHandler.dispose();
  }
  formatterHandler = undefined;
}

export async function activate(context: ExtensionContext): Promise<void> {
  if (!getConfigBladeEnable()) return;

  const outputChannel = window.createOutputChannel('blade');

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
  if (getConfigBladeFormatterEnable()) {
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
  if (getConfigBladeLinterEnable()) {
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

  //
  // completion
  //
  if (getConfigBladeCompletionEnable()) {
    const { document } = await workspace.getCurrentState();
    if (document.languageId === 'blade') {
      const existsBladeIndent = (await workspace.nvim.eval('exists("*GetBladeIndent")')) as number;
      let indentexpr: string;
      if (existsBladeIndent === 1) {
        indentexpr = 'GetBladeIndent()';
      } else {
        indentexpr = (await (await workspace.nvim.buffer).getOption('indentexpr')) as string;
      }

      try {
        await workspace.nvim.command('setlocal iskeyword+=:');
        await workspace.nvim.command('setlocal iskeyword+=-');
        await workspace.nvim.command('setlocal iskeyword+=.');
        await workspace.nvim.command(`setlocal indentexpr=${indentexpr}`);

        workspace.registerAutocmd({
          event: 'FileType',
          pattern: 'blade',
          request: true,
          callback: async () => {
            await workspace.nvim.command('setlocal iskeyword+=:');
            await workspace.nvim.command('setlocal iskeyword+=-');
            await workspace.nvim.command('setlocal iskeyword+=.');
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

    if (getConfigBladeCompletionEnableSnippets()) {
      context.subscriptions.push(
        languages.registerCompletionItemProvider(
          'blade-snippets',
          'blade',
          ['blade'],
          new BladeSnippetsCompletionProvider(context, outputChannel),
          [':']
        )
      );
    }

    if (getConfigBladeCompletionEnableDirective()) {
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

    if (getConfigBladeCompletionEnableLivewireDirectiveComponent()) {
      context.subscriptions.push(
        languages.registerCompletionItemProvider(
          'livewire-directive-component',
          'livewire',
          ['blade'],
          new LivewireDirectiveComponentProvider(),
          ['(']
        )
      );
    }

    if (getConfigBladeCompletionEnableLivewireTag()) {
      context.subscriptions.push(
        languages.registerCompletionItemProvider('livewire-tag', 'livewire', ['blade'], new LivewireTagProvider(), [
          '<',
        ])
      );

      context.subscriptions.push(
        languages.registerCompletionItemProvider(
          'livewire-tag-component',
          'livewire',
          ['blade'],
          new LivewireTagComponentProvider()
          //[...':.-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_']
        )
      );
    }

    if (getConfigBladeCompletionEnableLivewireWire()) {
      context.subscriptions.push(
        languages.registerCompletionItemProvider('livewire-wire', 'livewire', ['blade'], new LivewireWireProvider(), [
          'w',
        ])
      );

      context.subscriptions.push(
        languages.registerCompletionItemProvider(
          'livewire-wire-event',
          'livewire',
          ['blade'],
          new LivewireWireEventProvider(),
          [':', '.']
        )
      );

      context.subscriptions.push(
        languages.registerCompletionItemProvider(
          'livewire-wire-action',
          'livewire',
          ['blade'],
          new LivewireWireActionProvider(),
          ['=', "'", '"']
        )
      );
    }
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

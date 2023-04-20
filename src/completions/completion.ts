import {
  CancellationToken,
  CompletionContext,
  CompletionItem,
  CompletionItemProvider,
  CompletionList,
  ExtensionContext,
  languages,
  LinesTextDocument,
  OutputChannel,
  Position,
  workspace,
} from 'coc.nvim';

import path from 'path';

import {
  getConfigBladeCompletionEnable,
  getConfigBladeCompletionEnableDirective,
  getConfigBladeCompletionEnableLivewireDirectiveComponent,
  getConfigBladeCompletionEnableLivewireTag,
  getConfigBladeCompletionEnableLivewireWire,
  getConfigBladeCompletionEnableSnippets,
  getConfigBladeCompletionExcludeSnippets,
} from '../config';
import * as bladeDirectiveCompletionLaguageService from './languageService/bladeDirective';
import * as bladeSnippetsCompletionLanguageService from './languageService/bladeSnippets';
import * as livewireDirectiveComponentCompletionLanguageService from './languageService/livewireDirectiveComponent';
import * as livewireTagCompletionLanguageService from './languageService/livewireTag';
import * as livewireTagComponentCompletionLanguageService from './languageService/livewireTagComponent';
import * as livewireWireCompletionLanguageService from './languageService/livewireWire';
import * as livewireWireActionCompletionLanguageService from './languageService/livewireWireAction';
import * as livewireWireEventCompletionLanguageService from './languageService/livewireWireEvent';
import { BladeCompletionItemDataType } from './types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function register(context: ExtensionContext, _outputChannel: OutputChannel) {
  if (!getConfigBladeCompletionEnable()) return;

  const { document } = await workspace.getCurrentState();

  // Register Vim/Neovim options and autocmd for the blade.
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

  // Register provider
  context.subscriptions.push(
    languages.registerCompletionItemProvider('blade', 'blade', ['blade'], new BladeCompletionProvider(context), [
      '@', // bladeDirective
      ':', // bladeSnippets, livewireTagComponent, livewireEvent
      '(', // livewireDirectiveComponent,
      '<', // livewireTag
      'w', // livewireWire
      '.', // livewireWireEvent
      '=', // livewireWireAction
      '"', // livewireWireAction
      "'", // livewireWireAction
    ])
  );
}

class BladeCompletionProvider implements CompletionItemProvider {
  private _context: ExtensionContext;
  private directiveJsonFilePaths: string[];
  private snippetsFilePaths: string[];
  private excludeSnippetsKeys: string[];

  constructor(context: ExtensionContext) {
    this._context = context;
    this.directiveJsonFilePaths = [
      path.join(this._context.extensionPath, 'data', 'completion', 'blade-directive.json'),
      path.join(this._context.extensionPath, 'data', 'completion', 'livewire-directive.json'),
    ];
    this.snippetsFilePaths = [
      path.join(this._context.extensionPath, 'data', 'snippets', 'snippets.json'),
      path.join(this._context.extensionPath, 'data', 'snippets', 'helpers.json'),
      path.join(this._context.extensionPath, 'data', 'snippets', 'blade.json'),
      path.join(this._context.extensionPath, 'data', 'snippets', 'livewire.json'),
    ];
    this.excludeSnippetsKeys = getConfigBladeCompletionExcludeSnippets();
  }

  async provideCompletionItems(
    document: LinesTextDocument,
    position: Position,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _token: CancellationToken,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context?: CompletionContext | undefined
  ) {
    const items: CompletionItem[] | CompletionList = [];

    // bladeDirective
    if (getConfigBladeCompletionEnableDirective()) {
      const bladeDirectiveItems = await bladeDirectiveCompletionLaguageService.doCompletion(
        this._context,
        document,
        position,
        this.directiveJsonFilePaths
      );

      if (bladeDirectiveItems) {
        items.push(...bladeDirectiveItems);
      }
    }

    // bladeSnippets
    if (getConfigBladeCompletionEnableSnippets()) {
      const bladeSnippetsItems = await bladeSnippetsCompletionLanguageService.doCompletion(
        this._context,
        document,
        position,
        this.snippetsFilePaths,
        this.excludeSnippetsKeys
      );

      if (bladeSnippetsItems) {
        items.push(...bladeSnippetsItems);
      }
    }

    // livewireDirectiveComponent
    if (getConfigBladeCompletionEnableLivewireDirectiveComponent()) {
      const livewireDirectiveComponentItems = await livewireDirectiveComponentCompletionLanguageService.doCompletion(
        document,
        position
      );

      if (livewireDirectiveComponentItems) {
        items.push(...livewireDirectiveComponentItems);
      }
    }

    // livewireTag, livewireTagComponent
    if (getConfigBladeCompletionEnableLivewireTag()) {
      const livewireTagItems = await livewireTagCompletionLanguageService.doCompletion(document, position);
      if (livewireTagItems) {
        items.push(...livewireTagItems);
      }

      const livewireTagComponentItems = await livewireTagComponentCompletionLanguageService.doCompletion(
        document,
        position
      );
      if (livewireTagComponentItems) {
        items.push(...livewireTagComponentItems);
      }
    }

    // livewireWire, livewireWireAction, livewireWireEvent
    if (getConfigBladeCompletionEnableLivewireWire()) {
      const livewireWireItems = await livewireWireCompletionLanguageService.doCompletion(document, position);
      if (livewireWireItems) {
        items.push(...livewireWireItems);
      }

      const livewireWireActionItems = await livewireWireActionCompletionLanguageService.doCompletion(
        document,
        position
      );
      if (livewireWireActionItems) {
        items.push(...livewireWireActionItems);
      }

      const livewireWireEventItems = await livewireWireEventCompletionLanguageService.doCompletion(document, position);
      if (livewireWireEventItems) {
        items.push(...livewireWireEventItems);
      }
    }

    return items;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async resolveCompletionItem(item: CompletionItem, _token: CancellationToken) {
    const itemData: BladeCompletionItemDataType = item.data;

    // bladeSnippets
    if (getConfigBladeCompletionEnableSnippets() && itemData.source === 'blade-snippets') {
      return await bladeSnippetsCompletionLanguageService.doResolveCompletion(item);
    }

    return item;
  }
}

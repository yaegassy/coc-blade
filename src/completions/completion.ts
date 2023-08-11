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
  getConfigBladeCompletionEnableSnippets,
  getConfigBladeCompletionExcludeSnippets,
} from '../config';
import * as bladeDirectiveCompletionLaguageService from './languageService/bladeDirective';
import * as bladeSnippetsCompletionLanguageService from './languageService/bladeSnippets';
import { BladeCompletionItemDataType } from './types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function register(context: ExtensionContext, _outputChannel: OutputChannel) {
  if (!getConfigBladeCompletionEnable()) return;

  const { document } = await workspace.getCurrentState();
  if (document.languageId !== 'blade') return;

  // Register provider
  context.subscriptions.push(
    languages.registerCompletionItemProvider('blade', 'blade', ['blade'], new BladeCompletionProvider(context), [
      '@', // bladeDirective
      ':', // bladeSnippets
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

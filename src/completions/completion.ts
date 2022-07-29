import { ExtensionContext, languages, OutputChannel, workspace } from 'coc.nvim';

import {
  getConfigBladeCompletionEnable,
  getConfigBladeCompletionEnableDirective,
  getConfigBladeCompletionEnableLivewireDirectiveComponent,
  getConfigBladeCompletionEnableLivewireTag,
  getConfigBladeCompletionEnableLivewireWire,
  getConfigBladeCompletionEnableSnippets,
} from '../config';

import { BladeDirectiveCompletionProvider } from './provider/bladeDirective';
import { BladeSnippetsCompletionProvider } from './provider/bladeSnippets';
import { LivewireDirectiveComponentProvider } from './provider/livewireDirectiveComponent';
import { LivewireTagProvider } from './provider/livewireTag';
import { LivewireTagComponentProvider } from './provider/livewireTagComponent';
import { LivewireWireProvider } from './provider/livewireWire';
import { LivewireWireActionProvider } from './provider/livewireWireAction';
import { LivewireWireEventProvider } from './provider/livewireWireEvent';

export async function register(context: ExtensionContext, outputChannel: OutputChannel) {
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
}

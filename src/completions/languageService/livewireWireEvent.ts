import { CompletionItem, CompletionItemKind, LinesTextDocument, Position, TextEdit, workspace } from 'coc.nvim';

import { BladeCompletionItemDataType } from '../types';

export async function doCompletion(document: LinesTextDocument, position: Position) {
  const doc = workspace.getDocument(document.uri);

  const wordRange = doc.getWordRangeAtPosition(Position.create(position.line, position.character - 1), ':');
  if (!wordRange) return [];

  const text = document.getText(wordRange) || '';
  if (!text) return null;

  const linePrefix = document.lineAt(position).text.slice(0, position.character);
  const match = /(?:^|\s+)wire:(\w*)(?:(?:\.?)([A-Za-z0-9_.]*))?$/g.exec(linePrefix);
  if (!match || match.length < 3) {
    return [];
  }

  const attributes: string[] = [
    'key',
    'model',
    'model.debounce.100ms',
    'model.debounce.500ms',
    'model.lazy',
    'model.defer',
    'poll',
    'poll.500ms',
    'poll.keep-alive',
    'poll.visible',
    'init',
    'loading',
    'loading.class',
    'loading.class.remove',
    'loading.attr',
    'loading.delay',
    'loading.delay.shortest',
    'loading.delay.shorter',
    'loading.delay.short',
    'loading.delay.long',
    'loading.delay.longer',
    'loading.delay.longest',
    'dirty',
    'dirty.class',
    'dirty.class.remove',
    'dirty.attr',
    'offline',
    'offline.class',
    'offline.class.remove',
    'offline.attr',
    'target',
    'ignore',
    'ignore.self',
    'abort',
    'afterprint',
    'animationend',
    'animationiteration',
    'animationstart',
    'beforeprint',
    'beforeunload',
    'blur',
    'canplay',
    'canplaythrough',
    'change',
    'click',
    'click.prefetch',
    'contextmenu',
    'copy',
    'cut',
    'dblclick',
    'drag',
    'dragend',
    'dragenter',
    'dragleave',
    'dragover',
    'dragstart',
    'drop',
    'durationchange',
    'ended',
    'error',
    'focus',
    'focusin',
    'focusout',
    'fullscreenchange',
    'fullscreenerror',
    'hashchange',
    'input',
    'invalid',
    'keydown',
    'keydown.enter',
    'keypress',
    'keyup',
    'load',
    'loadeddata',
    'loadedmetadata',
    'loadstart',
    'message',
    'mousedown',
    'mouseenter',
    'mouseleave',
    'mousemove',
    'mouseover',
    'mouseout',
    'mouseup',
    'online',
    'open',
    'pagehide',
    'pageshow',
    'paste',
    'pause',
    'play',
    'playing',
    'popstate',
    'progress',
    'ratechange',
    'resize',
    'reset',
    'scroll',
    'search',
    'seeked',
    'seeking',
    'select',
    'show',
    'stalled',
    'storage',
    'submit',
    'submit.prevent',
    'suspend',
    'timeupdate',
    'toggle',
    'touchcancel',
    'touchend',
    'touchmove',
    'touchstart',
    'transitionend',
    'unload',
    'volumechange',
    'waiting',
    'wheel',
  ];

  const items = attributes.map((attribute) => {
    const edit: TextEdit = {
      range: {
        start: { line: position.line, character: position.character - text.length },
        end: position,
      },
      newText: 'wire:' + attribute,
    };

    const item: CompletionItem = {
      label: 'wire:' + attribute,
      kind: CompletionItemKind.Field,
      textEdit: edit,
      data: <BladeCompletionItemDataType>{
        source: 'livewire-wire-event',
      },
    };

    return item;
  });

  return items;
}

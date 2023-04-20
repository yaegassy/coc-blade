export type BladeCompletionItemDataType = {
  source: BladeCompletionItemSource;
  snippetsText?: string;
};

type BladeCompletionItemSource =
  | 'blade-directive'
  | 'blade-snippets'
  | 'livewire-directive-component'
  | 'livewire-tag'
  | 'livewire-tag-component'
  | 'livewire-wire'
  | 'livewire-wire-action'
  | 'livewire-wire-event';

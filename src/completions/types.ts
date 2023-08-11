export type BladeCompletionItemDataType = {
  source: BladeCompletionItemSource;
  snippetsText?: string;
};

type BladeCompletionItemSource = 'blade-directive' | 'blade-snippets';

import { workspace } from 'coc.nvim';

export function getConfigBladeEnable() {
  return workspace.getConfiguration('blade').get<boolean>('enable', true);
}

export function getConfigBladeFormatterEnable() {
  return workspace.getConfiguration('blade').get<boolean>('bladeFormatter.enable', true);
}

export function getConfigBladeLinterEnable() {
  return workspace.getConfiguration('blade').get<boolean>('bladeLinter.enable', true);
}

export function getConfigBladeCompletionEnable() {
  return workspace.getConfiguration('blade').get<boolean>('completion.enable', true);
}

export function getConfigBladeCompletionEnableDirective() {
  return workspace.getConfiguration('blade').get<boolean>('completion.enableDirective', true);
}

export function getConfigBladeCompletionEnableSnippets() {
  return workspace.getConfiguration('blade').get<boolean>('completion.enableSnippets', true);
}

export function getConfigBladeCompletionExcludeSnippets() {
  return workspace.getConfiguration('blade').get<string[]>('completion.excludeSnippets', []);
}

export function getConfigBladeFormatterOptIndentSize() {
  const defaultValue = 4;

  return workspace.getConfiguration('blade').get<number>('bladeFormatter.optIndentSize', defaultValue);
}

export function getConfigBladeFormatterOptWrapLineLength() {
  const defaultValue = 120;

  return workspace.getConfiguration('blade').get<number>('bladeFormatter.optWrapLineLength', defaultValue);
}

type WrapAttributes =
  | 'auto'
  | 'force'
  | 'force-aligned'
  | 'force-expand-multiline'
  | 'aligned-multiple'
  | 'preserve'
  | 'preserve-aligned';

export function getConfigBladeFormatterOptWrapAttributes() {
  const defaultValue = 'auto';

  return workspace.getConfiguration('blade').get<WrapAttributes>('bladeFormatter.optWrapAttributes', defaultValue);
}

export function getConfigBladeFormatterOptSortTailwindcssClasses() {
  const defaultValue = false;

  return workspace.getConfiguration('blade').get<boolean>('bladeFormatter.optSortTailwindcssClasses', defaultValue);
}

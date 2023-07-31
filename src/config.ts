import { workspace } from 'coc.nvim';

export function getConfigBladeEnable() {
  return workspace.getConfiguration('blade').get<boolean>('enable', true);
}

export function getConfigBladeFormatterEnable() {
  return workspace.getConfiguration('blade').get<boolean>('bladeFormatter.enable', true);
}

export function getConfigBladeParserLintEnable() {
  return workspace.getConfiguration('blade').get<boolean>('bladeParserLint.enable', true);
}

export function getConfigBladeParserLintDebug() {
  return workspace.getConfiguration('blade').get<boolean>('bladeParserLint.debug', false);
}

export function getConfigBladeParserLintOptCustomIfs() {
  return workspace.getConfiguration('blade').get<string[]>('bladeParserLint.optCustomIfs', []);
}

export function getConfigBladeParserLintOptDirectives() {
  return workspace.getConfiguration('blade').get<string[]>('bladeParserLint.optDirectives', []);
}

export function getConfigBladeParserLintOptIgnoreDirectives() {
  return workspace.getConfiguration('blade').get<string[]>('bladeParserLint.optIgnoreDirectives', []);
}

export function getConfigBladeCompletionEnable() {
  return workspace.getConfiguration('blade').get<boolean>('completion.enable', true);
}

export function getConfigBladeCompletionEnableSnippets() {
  return workspace.getConfiguration('blade').get<boolean>('completion.enableSnippets', true);
}

export function getConfigBladeCompletionEnableDirective() {
  return workspace.getConfiguration('blade').get<boolean>('completion.enableDirective', true);
}

export function getConfigBladeCompletionExcludeSnippets() {
  return workspace.getConfiguration('blade').get<string[]>('completion.excludeSnippets', []);
}

export function getConfigBladeCompletionEnableLivewireDirectiveComponent() {
  return workspace.getConfiguration('blade').get<boolean>('completion.enableLivewireDirectiveComponent', false);
}

export function getConfigBladeCompletionEnableLivewireTag() {
  return workspace.getConfiguration('blade').get<boolean>('completion.enableLivewireTag', false);
}

export function getConfigBladeCompletionEnableLivewireWire() {
  return workspace.getConfiguration('blade').get<boolean>('completion.enableLivewireWire', false);
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

export function getConfigBladeFormatterOptEndWithNewLine() {
  const defaultValue = true;

  return workspace.getConfiguration('blade').get<boolean>('bladeFormatter.optEndWithNewLine', defaultValue);
}

type EndOfLine = 'LF' | 'CRLF';

export function getConfigBladeFormatterOptEndOfLine() {
  const defaultValue = null;

  return workspace.getConfiguration('blade').get<EndOfLine | null>('bladeFormatter.optEndOFLine', defaultValue);
}

export function getConfigBladeFormatterOptUseTabs() {
  const defaultValue = false;

  return workspace.getConfiguration('blade').get<boolean>('bladeFormatter.optUseTabs', defaultValue);
}

export function getConfigBladeFormatterOptSortTailwindcssClasses() {
  const defaultValue = false;

  return workspace.getConfiguration('blade').get<boolean>('bladeFormatter.optSortTailwindcssClasses', defaultValue);
}

type SortHtmlAttributes = 'none' | 'alphabetical' | 'code-guide' | 'idiomatic' | 'vuejs' | 'custom';

export function getConfigBladeFormatterOptSortHtmlAttributes() {
  const defaultValue = 'none';

  return workspace
    .getConfiguration('blade')
    .get<SortHtmlAttributes>('bladeFormatter.optSortHtmlAttributes', defaultValue);
}

export function getConfigBladeFormatterOptCustomHtmlAttributesOrder() {
  const defaultValue = null;

  return workspace
    .getConfiguration('blade')
    .get<string | string[] | null>('bladeFormatter.optCustomHtmlAttributesOrder', defaultValue);
}

export function getConfigBladeFormatterOptNoMultipleEmptyLines() {
  const defaultValue = false;

  return workspace.getConfiguration('blade').get<boolean>('bladeFormatter.optNoMultipleEmptyLines', defaultValue);
}

export function getConfigBladeFormatterOptNoPhpSyntaxCheck() {
  const defaultValue = false;

  return workspace.getConfiguration('blade').get<boolean>('bladeFormatter.optNoPhpSyntaxCheck', defaultValue);
}

export function getConfigBladeFormatterOptNoSingleQuote() {
  const defaultValue = false;

  return workspace.getConfiguration('blade').get<boolean>('bladeFormatter.optNoSingleQuote', defaultValue);
}

export function getConfigBladeFormatterOptWrapAttributesMinAttrs() {
  const defaultValue = null;

  return workspace
    .getConfiguration('blade')
    .get<number | null>('bladeFormatter.optWrapAttributesMinAttrs', defaultValue);
}

export function getConfigBladeFormatterOptIndentInnerHtml() {
  const defaultValue = false;

  return workspace.getConfiguration('blade').get<boolean>('bladeFormatter.optIndentInnerHtml', defaultValue);
}

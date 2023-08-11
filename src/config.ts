import { workspace } from 'coc.nvim';

const _config = workspace.getConfiguration('blade');

/**
 * Settings that are frequently referenced from multiple locations are added here
 */
export const config = {
  enable: _config.get<boolean>('enable', true),
  completion: {
    get enable() {
      return _config.get<boolean>('completion.enable', true);
    },
    get enableSnippets() {
      return _config.get<boolean>('completion.enableSnippets', true);
    },
    get enableDirective() {
      return _config.get<boolean>('completion.enableDirective', true);
    },
    get excludeSnippets() {
      return _config.get<string[]>('completion.excludeSnippets', []);
    },
  },
  bladeFormatter: {
    get enable() {
      return _config.get<boolean>('bladeFormatter.enable', true);
    },
    get optIndentSize() {
      const defaultValue = 4;
      return _config.get<number>('bladeFormatter.optIndentSize', defaultValue);
    },
    get optWrapLineLength() {
      const defaultValue = 120;
      return _config.get<number>('bladeFormatter.optWrapLineLength', defaultValue);
    },
    get optWrapAttributes() {
      type WrapAttributes =
        | 'auto'
        | 'force'
        | 'force-aligned'
        | 'force-expand-multiline'
        | 'aligned-multiple'
        | 'preserve'
        | 'preserve-aligned';
      const defaultValue = 'auto';
      return _config.get<WrapAttributes>('bladeFormatter.optWrapAttributes', defaultValue);
    },
    get optEndWithNewLine() {
      const defaultValue = true;
      return _config.get<boolean>('bladeFormatter.optEndWithNewLine', defaultValue);
    },
    get optEndOFLine() {
      type EndOfLine = 'LF' | 'CRLF';
      const defaultValue = null;
      return _config.get<EndOfLine | null>('bladeFormatter.optEndOFLine', defaultValue);
    },
    get optUseTabs() {
      const defaultValue = false;
      return _config.get<boolean>('bladeFormatter.optUseTabs', defaultValue);
    },
    get optSortTailwindcssClasses() {
      const defaultValue = false;
      return _config.get<boolean>('bladeFormatter.optSortTailwindcssClasses', defaultValue);
    },
    get optSortHtmlAttributes() {
      type SortHtmlAttributes = 'none' | 'alphabetical' | 'code-guide' | 'idiomatic' | 'vuejs' | 'custom';
      const defaultValue = 'none';
      return _config.get<SortHtmlAttributes>('bladeFormatter.optSortHtmlAttributes', defaultValue);
    },
    get optCustomHtmlAttributesOrder() {
      const defaultValue = null;
      return _config.get<string | string[] | null>('bladeFormatter.optCustomHtmlAttributesOrder', defaultValue);
    },
    get optNoMultipleEmptyLines() {
      const defaultValue = false;
      return _config.get<boolean>('bladeFormatter.optNoMultipleEmptyLines', defaultValue);
    },
    get optNoPhpSyntaxCheck() {
      const defaultValue = false;
      return _config.get<boolean>('bladeFormatter.optNoPhpSyntaxCheck', defaultValue);
    },
    get optNoSingleQuote() {
      const defaultValue = false;
      return _config.get<boolean>('bladeFormatter.optNoSingleQuote', defaultValue);
    },
    get optWrapAttributesMinAttrs() {
      const defaultValue = null;
      return _config.get<number | null>('bladeFormatter.optWrapAttributesMinAttrs', defaultValue);
    },
    get optIndentInnerHtml() {
      const defaultValue = false;
      return _config.get<boolean>('bladeFormatter.optIndentInnerHtml', defaultValue);
    },
    get optExtraLiners() {
      const defaultValue = [];
      return _config.get<string[]>('bladeFormatter.optExtraLiners', defaultValue);
    },
  },
  bladeParserLint: {
    get enable() {
      return _config.get<boolean>('bladeParserLint.enable', true);
    },
    get debug() {
      return _config.get<boolean>('bladeParserLint.debug', false);
    },
    get optCustomIfs() {
      return _config.get<string[]>('bladeParserLint.optCustomIfs', []);
    },
    get optDirectives() {
      return _config.get<string[]>('bladeParserLint.optDirectives', []);
    },
    get optIgnoreDirectives() {
      return _config.get<string[]>('bladeParserLint.optIgnoreDirectives', []);
    },
  },
};

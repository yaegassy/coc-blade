import { ExtensionContext, window } from 'coc.nvim';

import { config } from './config';

import * as bladeCodeActionFeature from './actions/action';
import * as bladeFormatterRunCommandFeature from './commands/bladeFormatterRun';
import * as showOutputCommandFeature from './commands/showOutput';
import * as bladeShowReferencesCommandFeature from './commands/showReferences';
import * as bladeCompletionFeature from './completions/completion';
import * as bladeDefinisionFeature from './definitions/definition';
import * as bladeFormatterDocumantFormattingEditFeature from './documentFormats/documentFormat';
import * as bladeHoverFeature from './hovers/hover';
import * as bladeParserLintFeature from './linters/bladeParserLint';

export async function activate(context: ExtensionContext): Promise<void> {
  if (!config.enable) return;

  const outputChannel = window.createOutputChannel('blade');

  showOutputCommandFeature.register(context, outputChannel);
  bladeFormatterRunCommandFeature.register(context, outputChannel);
  bladeShowReferencesCommandFeature.register(context, outputChannel);
  bladeCompletionFeature.register(context, outputChannel);
  bladeFormatterDocumantFormattingEditFeature.register(context, outputChannel);
  bladeHoverFeature.register(context);
  bladeDefinisionFeature.register(context);
  bladeCodeActionFeature.register(context);
  bladeParserLintFeature.register(context, outputChannel);
}

import { ExtensionContext, window } from 'coc.nvim';

import { getConfigBladeEnable } from './config';

import * as bladeCodeActionFeature from './actions/action';
import * as bladeFormatterRunCommandFeature from './commands/bladeFormatterRun';
import * as showOutputCommandFeature from './commands/showOutput';
import * as bladeCompletionFeature from './completions/completion';
import * as bladeDefinisionFeature from './definitions/definition';
import * as bladeFormatterDocumantFormattingEditFeature from './documentFormats/documentFormat';
import * as bladeHoverFeature from './hovers/hover';
import * as bladeLinterFeature from './linters/bladeLinter';

export async function activate(context: ExtensionContext): Promise<void> {
  if (!getConfigBladeEnable()) return;

  const outputChannel = window.createOutputChannel('blade');

  showOutputCommandFeature.register(context, outputChannel);
  bladeFormatterRunCommandFeature.register(context, outputChannel);
  await bladeCompletionFeature.register(context, outputChannel);
  bladeFormatterDocumantFormattingEditFeature.register(context, outputChannel);
  bladeLinterFeature.register(context, outputChannel);
  bladeHoverFeature.register(context);
  bladeDefinisionFeature.register(context);
  bladeCodeActionFeature.register(context);
}

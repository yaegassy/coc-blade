import { ExtensionContext, Hover, HoverProvider, Position, TextDocument, workspace } from 'coc.nvim';

import fs from 'fs';
import path from 'path';

import { BladeHover, bladeHovers } from './lang';

export class BladeHoverProvider implements HoverProvider {
  private context: ExtensionContext;

  constructor(context: ExtensionContext) {
    this.context = context;
  }

  public async provideHover(document: TextDocument, position: Position): Promise<Hover | null> {
    const doc = workspace.getDocument(document.uri);
    if (!doc) return null;

    // Add @
    const wordRange = doc.getWordRangeAtPosition(position, '@');
    if (!wordRange) return null;

    const text = document.getText(wordRange) || '';
    if (!text) return null;

    const result = await this.getHover(text, 'blade');
    if (!result) return null;

    return {
      contents: {
        kind: 'markdown',
        value: result,
      },
    };
  }

  private async getHover(text: string, hoverLang: string): Promise<string> {
    const defineHovers: BladeHover[] = bladeHovers;

    let result = '';
    for (const h in defineHovers) {
      if (text === defineHovers[h].prefix || defineHovers[h].alias.includes(text)) {
        const markdownPath = path.join(
          this.context.extensionPath,
          'data',
          'documantation',
          hoverLang,
          // File names remove the @ and $.
          defineHovers[h].prefix.replace(/@|\$/, '') + '.md'
        );

        try {
          result = fs.readFileSync(markdownPath, { encoding: 'utf8' });
        } catch (e) {
          return result;
        }
        break;
      }
    }

    return result;
  }
}

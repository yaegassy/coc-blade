import {
  CancellationToken,
  Definition,
  DefinitionProvider,
  Location,
  Position,
  ProviderResult,
  Range,
  TextDocument,
  Uri,
  workspace,
} from 'coc.nvim';
import fs from 'fs';

export default class BladeDefinitionProvider implements DefinitionProvider {
  public provideDefinition(
    document: TextDocument,
    position: Position,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: CancellationToken
  ): ProviderResult<Definition> {
    const doc = workspace.getDocument(document.uri);
    if (!doc) return null;

    // add keyword `-`, `.`, `"` and `'`
    const wordRange = doc.getWordRangeAtPosition(position, '-."\'');
    if (!wordRange) return null;

    const text = document.getText(wordRange) || '';
    if (!text) return null;

    let locationPath: string | undefined;
    if (text.startsWith('x-jet-')) {
      locationPath = this.getComponentLocationPath(workspace.root, text, true);
    } else if (text.startsWith('x-')) {
      locationPath = this.getComponentLocationPath(workspace.root, text, false);
    } else if (text.startsWith('"') || text.startsWith("'")) {
      const templateStr = text.replace(/\"/g, '').replace(/\'/g, '');
      locationPath = this.getTemplateLocationPath(workspace.root, templateStr);
    }

    if (locationPath) {
      const location: Location = {
        uri: locationPath,
        range: Range.create(Position.create(0, 0), Position.create(0, 0)),
      };
      return location;
    }

    return null;
  }

  private getComponentLocationPath(
    workspaceRootPath: string,
    componentTag: string,
    isJet: boolean
  ): string | undefined {
    let componentText = componentTag.replace(/^x-/, '');
    if (isJet) {
      componentText = componentTag.replace(/^x-jet-/, '');
    }

    let componentPath = this.componentNameToPath(componentText, isJet);
    if (!fs.existsSync(workspaceRootPath + componentPath)) {
      componentPath = this.componentNameToIndexPath(componentText, isJet);
      if (!fs.existsSync(workspaceRootPath + componentPath)) {
        return undefined;
      }
    }
    const locationPath = Uri.parse(workspaceRootPath + componentPath).toString();
    return locationPath;
  }

  private getTemplateLocationPath(workspaceRootPath: string, templateStr: string): string | undefined {
    let templatePath = this.templateNameToPath(templateStr);
    if (!fs.existsSync(workspaceRootPath + templatePath)) {
      templatePath = this.templateNameToIndexPath(templateStr);
      if (!fs.existsSync(workspaceRootPath + templatePath)) {
        return undefined;
      }
    }
    const locationPath = Uri.parse(workspaceRootPath + templatePath).toString();
    return locationPath;
  }

  private componentNameToPath(path: string, isJet: boolean): string {
    if (isJet) {
      return `/resources/views/vendor/jetstream/components/${path.replace(/\./g, '/')}.blade.php`;
    } else {
      return `/resources/views/components/${path.replace(/\./g, '/')}.blade.php`;
    }
  }

  private componentNameToIndexPath(path: string, isJet: boolean): string {
    if (isJet) {
      return `/resources/views/vendor/jetstream/components/${path.replace(/\./g, '/')}/index.blade.php`;
    } else {
      return `/resources/views/components/${path.replace(/\./g, '/')}/index.blade.php`;
    }
  }

  private templateNameToPath(path: string): string {
    return `/resources/views/${path.replace(/\./g, '/')}.blade.php`;
  }

  private templateNameToIndexPath(path: string): string {
    return `/resources/views/${path.replace(/\./g, '/')}/index.blade.php`;
  }
}

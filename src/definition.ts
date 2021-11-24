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
    if (text.startsWith('x-')) {
      locationPath = this.getComponentLocationPath(workspace.root, text);
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

  private getComponentLocationPath(workspaceRootPath: string, componentTag: string): string | undefined {
    const componentText = componentTag.replace(/^x-/, '');
    let componentPath = this.componentNameToPath(componentText);
    if (!fs.existsSync(workspaceRootPath + componentPath)) {
      componentPath = this.componentNameToIndexPath(componentText);
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

  private componentNameToPath(path: string): string {
    return `/resources/views/components/${path.replace(/\./g, '/')}.blade.php`;
  }

  private componentNameToIndexPath(path: string): string {
    return `/resources/views/components/${path.replace(/\./g, '/')}/index.blade.php`;
  }

  private templateNameToPath(path: string): string {
    return `/resources/views/${path.replace(/\./g, '/')}.blade.php`;
  }

  private templateNameToIndexPath(path: string): string {
    return `/resources/views/${path.replace(/\./g, '/')}/index.blade.php`;
  }
}

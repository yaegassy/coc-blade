import { workspace } from 'coc.nvim';

import fs from 'fs';
import path from 'path';

type ComponentWithSrcFile = {
  name: string;
  srcFile: string;
};

type ComponentWithProps = {
  name: string;
  props: string[] | undefined;
};

export async function getAllComponents(prefix?: string) {
  const componentWithSrcFile: ComponentWithSrcFile[] = [];

  try {
    const text = await fs.promises.readFile(
      path.join(workspace.root, 'bootstrap', 'cache', 'livewire-components.php'),
      {
        encoding: 'utf8',
      }
    );

    const regex = /'(.*)'\s*=>\s*'(.*)',*/g;
    const matches = [...text.matchAll(regex)];

    for (const m of matches) {
      if (!prefix || m[1].startsWith(prefix)) {
        componentWithSrcFile.push({
          name: m[1],
          srcFile: m[2],
        });
      }
    }
  } catch (e) {
    // noop
  }

  return componentWithSrcFile;
}

export async function getAllComponentsWithProps(prefix?: string) {
  const componentWithProps: ComponentWithProps[] = [];

  try {
    const components = await getAllComponents(prefix);
    for (const component of components) {
      const params = await getComponentParams(component.name, component.srcFile);
      const properties = await getComponentPropertiesFromComponent(component.name, component.srcFile);

      const prepareProps: string[] = [];
      if (params) prepareProps.push(...params.filter((v) => !!v));
      if (properties) prepareProps.push(...properties.filter((v) => !!v));

      const props = [...new Set(prepareProps)];

      componentWithProps.push({
        name: component.name,
        props: props ? props : undefined,
      });
    }
  } catch (e) {}

  return componentWithProps;
}

export async function getComponentPath(componentName: string) {
  try {
    const components = await getAllComponents();
    const component = components.find((component) => component.name === componentName);
    if (!component) {
      throw new Error('Cannot find component');
    }
    return component.srcFile;
  } catch (e) {
    return undefined;
  }
}

export async function getComponentClassSource(component: string, srcFile?: string) {
  try {
    if (!srcFile) {
      srcFile = await getComponentPath(component);
    }
    if (!srcFile) {
      throw new Error('Cannot find class src file');
    }

    srcFile = srcFile.replace(/\\\\/g, path.sep);
    srcFile = srcFile.replace(/App/g, 'app');
    const srcFileSplit = srcFile.split(path.sep);

    return await fs.promises.readFile(path.join(workspace.root, ...srcFileSplit) + '.php', {
      encoding: 'utf8',
    });
  } catch (e) {
    return null;
  }
}

export async function getComponentParams(component: string, srcFile?: string) {
  try {
    const classText = await getComponentClassSource(component, srcFile);
    if (!classText) {
      throw new Error('Cannot find class');
    }
    const match = /function\s*mount\s*\(([^\)]*)/gm.exec(classText);
    if (!match || !match.length) {
      throw new Error('Cannot find mount() function');
    }
    const variables = match[1].split(/,/gm);
    const params: string[] = [];
    for (const variable of variables) {
      const words = variable.split(/\$/gm);
      if (words.length) {
        params.push(words[1]);
      }
    }
    return params;
  } catch (e) {
    return null;
  }
}

export async function getComponentFromView(viewFile: string) {
  try {
    viewFile = viewFile.replace(/\\/g, path.sep);
    const viewMatch = new RegExp(`.*${path.sep}resources${path.sep}views${path.sep}(.*).blade.php`).exec(viewFile);
    if (!viewMatch || !viewMatch.length) {
      throw new Error('View file path is not correct');
    }
    let view: string;
    if (process.platform === 'win32') {
      view = viewMatch[1].replace(/\\/g, '\\.');
    } else {
      view = viewMatch[1].replace(/\//g, '\\.');
    }

    const components = await getAllComponents();
    for (const component of components) {
      const classText = await getComponentClassSource(component.name, component.srcFile);
      if (!classText) {
        continue;
      }
      const match = new RegExp(view, 'mg').exec(classText);
      if (match) {
        return component;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function getComponentActionsFromView(viewFile: string) {
  try {
    const component = await getComponentFromView(viewFile);
    if (!component) {
      throw new Error('Cannot find component');
    }
    const classText = await getComponentClassSource(component.name, component.srcFile);
    if (!classText) {
      throw new Error('Cannot find component source');
    }
    const regex = /^\s*(?:public\s+)?function\s*(\w+)/gm;
    const actions: string[] = [];
    while (true) {
      const match = regex.exec(classText);
      if (!match) {
        break;
      }
      if (match && match.length) {
        if (match[1] !== 'mount' && match[1] !== 'render') {
          actions.push(match[1]);
        }
      }
    }
    return actions;
  } catch (e) {
    return null;
  }
}

export async function getComponentPropertiesFromView(viewFile: string) {
  try {
    const component = await getComponentFromView(viewFile);
    if (!component) {
      throw new Error('Cannot find component');
    }
    const classText = await getComponentClassSource(component.name, component.srcFile);
    if (!classText) {
      throw new Error('Cannot find component source');
    }
    const regex = /(?<![\/\*#].*)public\s+\$(\w+)/gm;
    const actions: string[] = [];
    while (true) {
      const match = regex.exec(classText);
      if (!match) {
        break;
      }
      if (match && match.length) {
        actions.push(match[1]);
      }
    }
    return actions;
  } catch (e) {
    return null;
  }
}

export async function getComponentPropertiesFromComponent(name: string, srcFile: string) {
  try {
    const classText = await getComponentClassSource(name, srcFile);
    if (!classText) {
      throw new Error('Cannot find component source');
    }
    const regex = /(?<![\/\*#].*)public\s+\$(\w+)/gm;
    const actions: string[] = [];
    while (true) {
      const match = regex.exec(classText);
      if (!match) {
        break;
      }
      if (match && match.length) {
        actions.push(match[1]);
      }
    }
    return actions;
  } catch (e) {
    return null;
  }
}

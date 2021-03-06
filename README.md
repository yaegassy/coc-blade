# coc-blade

Laravel Blade Templates extension for [coc.nvim](https://github.com/neoclide/coc.nvim). Provides "formatter", "linter", "completion" and more...

<img width="760" alt="coc-blade-demo" src="https://user-images.githubusercontent.com/188642/135827583-09771a6d-2d14-48ee-bd9e-e1081ee3c8ad.gif">

## Features

- Format
  - by [blade-formatter](https://github.com/shufo/blade-formatter)
- Lint
  - by [laravel-blade-linter](https://github.com/bdelespierre/laravel-blade-linter)
- Completion
  - Blade Snippets Completion
  - Blade Directive Completion
  - Livewire directive component completion
  - Livewire tag completion
  - Livewire wire completion
- Definition
  - Jump to template file specified by `@extends`, `@include` directive, etc.
  - Jump to "Blade Components" file.
    - **[Warning]** Class-based Components are not supported.
  - Jump to "Jetstream Components" file.
- Code Action
  - Add a blade comment to disable the formatting.
- Hover

## Install

**CocInstall**:

```vim
:CocInstall coc-blade
```

**vim-plug**:

```vim
Plug 'yaegassy/coc-blade', {'do': 'yarn install --frozen-lockfile'}
```

**Recommended coc extension**:

- [coc-html](https://github.com/neoclide/coc-html)

## Note

### Filetype related

The "filetype" must be `blade` for this extension to work.

Install "blade" related plugin (e.g. [jwalton512/vim-blade](https://github.com/jwalton512/vim-blade) or [sheerun/vim-polyglot](https://github.com/sheerun/vim-polyglot)).

## Usage Topics

### formatter (blade-formatter)

**Run**:

- `:call CocAction('format')`
- `:CocCommand bladeFormatter.run`

> If there is a "syntax error" in the blade template, the formatting will fail.

**Configuration file: .bladeformatterrc.json or .bladeformatterrc**:

To configure settings per project, put `.bladeformatterrc.json` or `.bladeformatterrc` to your project root will blade-formatter treat it as setting files.

Configuration file will like below:

```json
{
    "indentSize": 4,
    "wrapAttributes": "auto",
    "wrapLineLength": 120,
    "endWithNewLine": true,
    "useTabs": false,
    "sortTailwindcssClasses": true
}
```

**Ignoring Files: .bladeignore**:

To ignore specific file, put `.bladeignore` to your repository root will `blade-formatter` treat it as ignored files.

```gitignore
resources/views/users/index.blade.php
resources/views/products/*
resources/views/books/**/*
```

**Disabling format in file**:

- See: <https://github.com/shufo/blade-formatter#disabling-format-in-file>

> In coc-blade, there is a code action feature to add a blade comment to disable the formatting.

### linter (laravel-blade-linter)

You will need to have [laravel-blade-linter](https://github.com/bdelespierre/laravel-blade-linter) installed in your "Laravel project".

If "laravel-blade-linter" is not detected, the lint (diagnostics) feature is automatically disabled.

```sh
composer require --dev bdelespierre/laravel-blade-linter
```

### snippets completion (laravel-blade-snippets-vscode)

You can auto-complete by typing `b:`, `lv:`, `Blade::`, `livewire::`.

It uses snippet files from [onecentlin/laravel-blade-snippets-vscode](https://github.com/onecentlin/laravel-blade-snippets-vscode) to provide completion.

### directive completion

You can auto-complete by typing `@`.

- [DEMO](https://github.com/yaegassy/coc-blade/pull/10)

### Livewire directive component completion

You can auto-complete by typing `@livewire(`.

Obtains the component name registered in the project and auto-completion. Parse `bootstrap/cache/livewire-components.php`.

- [DEMO](https://github.com/yaegassy/coc-blade/pull/11#issuecomment-1078704670)

### Livewire tag completion

You can auto-complete by typing `<livewire:`.

Obtains the component name registered in the project and auto-completion. Parse `bootstrap/cache/livewire-components.php` files.

- [DEMO](https://github.com/yaegassy/coc-blade/pull/11#issuecomment-1078704901)

### Livewire wire completion

You can auto-complete by typing `wire:`, `wire:click="`, `wire:model="`.

Event, Action, and Property are supported.

Parses `bootstrap/cache/livewire-components.php` files and target component classes.

- [DEMO](https://github.com/yaegassy/coc-blade/pull/11#issuecomment-1078705276)

## Configuration options

- `blade.enable`: Enable coc-blade extension, default: `true`
- `blade.completion.enable`: Enable completion feature, default: `true`
- `blade.completion.enableDirective`: Enable directive completion, default: `true`
- `blade.completion.enableSnippets`: Enable snippets completion, default: `true`
- `blade.completion.excludeSnippets`: Exclude specific prefix in snippet completion, e.g. `["b:extends", "lv:url", "Blade::component"]`, default: `[]`
- `blade.bladeFormatter.enable`: Enable/Disable the formatting feature by `blade-formatter`, default: `true`
- `blade.bladeFormatter.optIndentSize`: Indent size (`--indent-size`), valid type `integer` or `null`, default: `null`,
- `blade.bladeFormatter.optWrapLineLength`: The length of line wrap size (`--wrap-line-length`), valid type `integer` or `null`, default: `null`
- `blade.bladeFormatter.optWrapAttributes`: The way to wrap attributes (`--wrap-attributes`), valid options `["auto", "force", "force-aligned", "force-expand-multiline", "aligned-multiple", "preserve", "preserve-aligned"]`, valid type `string` or `null`, default: `null`
- `blade.bladeFormatter.optSortTailwindcssClasses`: markdownDescription": "Sort Tailwindcss classes automatically. This option respects `tailwind.config.js` and sort classes according to settings, valid type `boolean` or `null`, default: `null`
- `blade.bladeLinter.enable`: Enable/Disable the linting feature by `laravel-blade-linter`, default: `true`

## Commands

- `blade.showOutput`: Show blade output channel
- `blade.bladeFormatter.run`: Run blade-formatter

## Code Actions

**Example key mapping (Code Action related)**:

```vim
nmap <silent> ga <Plug>(coc-codeaction-line)
nmap <silent> gA <Plug>(coc-codeaction)
```

**Actions**:

- `Add "blade-formatter-disable-next-line" for this line`
- `Add "blade-formatter-disable" for this line`
- `Add "blade-formatter-enable" for this line`
- `Add "blade-formatter-disable" for whole file`

## Thanks

- [shufo/blade-formatter](https://github.com/shufo/blade-formatter)
- [shufo/vscode-blade-formatter](https://github.com/shufo/vscode-blade-formatter)
- [bdelespierre/laravel-blade-linter](https://github.com/bdelespierre/laravel-blade-linter)
- [onecentlin/laravel-blade-snippets-vscode](https://github.com/onecentlin/laravel-blade-snippets-vscode)

## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)

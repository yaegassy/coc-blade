# coc-blade

Laravel Blade Templates extension for [coc.nvim](https://github.com/neoclide/coc.nvim). Provides "formatter", "linter", "completion" and more...

## Features

- Format
  - by [blade-formatter](https://github.com/shufo/blade-formatter) (An opinionated blade template formatter for Laravel that respects readability)
- Lint
  - by [laravel-blade-linter](https://github.com/bdelespierre/laravel-blade-linter) (A simple Blade template syntax checker for Laravel)
- Completion
  - Completion of snippets data via `completionItemProvider`
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

Set up `autocmd BufNewFile,BufRead *.blade.php set filetype=blade` in `.vimrc/init.vim`, Or install "blade" related plugin (e.g. [jwalton512/vim-blade](https://github.com/jwalton512/vim-blade) or [sheerun/vim-polyglot](https://github.com/sheerun/vim-polyglot)).

## Usage Topics

### formatter (blade-formatter)

**Run**:

- `:call CocAction('format')`
- `:CocCommand bladeFormatter.run`

> If there is a "syntax error" in the blade template, the formatting will fail.

**Ignoring Files: .bladeignore**:

To ignore specific file, put `.bladeignore` to your repository root will `blade-formatter` treat it as ignored files.

```gitignore
resources/views/users/index.blade.php
resources/views/products/*
resources/views/books/**/*
```

### linter (laravel-blade-linter)

You will need to have [laravel-blade-linter](https://github.com/bdelespierre/laravel-blade-linter) installed in your "Laravel project".

If "laravel-blade-linter" is not detected, the lint (diagnostics) feature is automatically disabled.

```sh
composer require --dev bdelespierre/laravel-blade-linter
```

## Configuration options

- `blade.enable`: Enable coc-blade extension, default: `true`
- `blade.completion.enable`: Enable snippets completion, default: `true`
- `blade.completion.exclude`: Exclude specific prefix in snippet completion, e.g. `["b:extends", "lv:url", "Blade::component"]`, default: `[]`
- `blade.bladeFormatter.enable`: Enable/Disable the formatting feature by `blade-formatter`, default: `true`
- `blade.bladeFormatter.toolPath`: Absolute path to blade-formatter. If there is no setting, the built-in blade-formatter will be used, default: `""`
- `blade.bladeFormatter.optIndentSize`: Indent size (`--indent-size`), default: `4`
- `blade.bladeFormatter.optWrapLineLength`: The length of line wrap size (`--wrap-line-length`), default: `120`
- `blade.bladeFormatter.optWrapAttributes`: The way to wrap attributes (`--wrap-attributes`), valid options `["auto", "force", "force-aligned", "force-expand-multiline", "aligned-multiple", "preserve", "preserve-aligned"]`, default: `"auto"`
- `blade.bladeLinter.enable`: Enable/Disable the linting feature by `laravel-blade-linter`, default: `true`

## Commands

- `blade.bladeFormatter.run`: Run blade-formatter

## Thanks

- [shufo/blade-formatter](https://github.com/shufo/blade-formatter)
- [shufo/vscode-blade-formatter](https://github.com/shufo/vscode-blade-formatter)
- [bdelespierre/laravel-blade-linter](https://github.com/bdelespierre/laravel-blade-linter)
- [onecentlin/laravel-blade-snippets-vscode](https://github.com/onecentlin/laravel-blade-snippets-vscode)

## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)

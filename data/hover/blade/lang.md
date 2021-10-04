# @lang

If you are using the Blade templating engine, you may use the `{{ }}` syntax to echo the translation string or use the `@lang` directive:

---

```blade
{{ __('messages.welcome') }}

@lang('messages.welcome')
```

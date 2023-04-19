## @prependOnce

Since the `@once` directive is often used in conjunction with the `@push` or `@prepend` directives, the `@pushOnce` and `@prependOnce` directives are available for your convenience:

---

```blade
@prependOnce('scripts')
    <script>
        // Your custom JavaScript...
    </script>
@endPrependOnce
```

# @includeUnless

If you would like to `@include` a view if a given boolean expression evaluates to true or false, you may use the `@includeWhen` and `@includeUnless` directives:

---

```blade
@includeWhen($boolean, 'view.name', ['status' => 'complete'])

@includeUnless($boolean, 'view.name', ['status' => 'complete'])
```

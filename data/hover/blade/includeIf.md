# @includeIf

If you attempt to `@include` a view which does not exist, Laravel will throw an error. If you would like to include a view that may or may not be present, you should use the `@includeIf` directive:

---

```blade
@includeIf('view.name', ['status' => 'complete'])
```

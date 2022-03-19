# @unless

Blade also provides an `@unless` directive:

These directives function identically to their PHP counterparts:

---

```blade
@unless (Auth::check())
    You are not signed in.
@endunless
```

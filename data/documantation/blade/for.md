# @for

In addition to conditional statements, Blade provides simple directives for working with PHP's loop structures. Again, each of these directives functions identically to their PHP counterparts:

---

```blade
@for ($i = 0; $i < 10; $i++)
    The current value is {{ $i }}
@endfor
```

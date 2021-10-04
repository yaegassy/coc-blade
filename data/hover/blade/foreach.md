# @foreach

In addition to conditional statements, Blade provides simple directives for working with PHP's loop structures. Again, each of these directives functions identically to their PHP counterparts:

---

```blade
@foreach ($users as $user)
    <p>This is user {{ $user->id }}</p>
@endforeach
```

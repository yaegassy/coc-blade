# @slot

we can inject content into the named slot using the `@slot` directive.

---

```blade
@component('alert')
    @slot('title')
        Forbidden
    @endslot

    You are not allowed to access this resource!
@endcomponent
```

# @props

You may specify which attributes should be considered data variables using the `@props` directive

---

```blade
@props(['type' => 'info', 'message'])

<div {{ $attributes->merge(['class' => 'alert alert-'.$type]) }}>
    {{ $message }}
</div>
```

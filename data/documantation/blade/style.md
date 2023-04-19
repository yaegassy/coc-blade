# @style

the `@style` directive may be used to conditionally add inline CSS styles to an HTML element:

---

```blade
@php
    $isActive = true;
@endphp
 
<span @style([
    'background-color: red',
    'font-weight: bold' => $isActive,
])></span>
 
<span style="background-color: red; font-weight: bold;"></span>
```

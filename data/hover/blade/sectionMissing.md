# @sectionMissing

You may use the `sectionMissing` directive to determine if a section does not have content:

---

```blade
@sectionMissing('navigation')
    <div class="pull-right">
        @include('default-navigation')
    </div>
@endif
```

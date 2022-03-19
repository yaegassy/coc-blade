# @hasSection

You may determine if a template inheritance section has content using the `@hasSection` directive:

---

```blade
@hasSection('navigation')
    <div class="pull-right">
        @yield('navigation')
    </div>

    <div class="clearfix"></div>
@endif
```

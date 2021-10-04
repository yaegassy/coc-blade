# @push

Blade allows you to push to named stacks which can be rendered somewhere else in another view or layout. This can be particularly useful for specifying any JavaScript libraries required by your child views:

---

```blade
@push('scripts')
    <script src="/example.js"></script>
@endpush
```

# @json

The `@json` directive accepts the same arguments as PHP's `json_encode` function. By default, the `@json` directive calls the `json_encode` function with the `JSON_HEX_TAG`, `JSON_HEX_APOS`, `JSON_HEX_AMP`, and `JSON_HEX_QUOT` flags:

---

```blade
<script>
    var app = @json($array);

    var app = @json($array, JSON_PRETTY_PRINT);
</script>
```

# @method

Since HTML forms can't make `PUT`, `PATCH`, or `DELETE` requests, you will need to add a hidden `_method` field to spoof these HTTP verbs. The `@method` Blade directive can create this field for you:

---

```blade
<form action="/foo/bar" method="POST">
    @method('PUT')

    ...
</form>
```

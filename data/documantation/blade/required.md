## @required

the `@required` directive may be used to indicate if a given element should be "required":

---

```blade
<input type="text"
        name="title"
        value="title"
        @required($user->isAdmin()) />
```

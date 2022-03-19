# @checked

This directive will echo checked if the provided condition evaluates to true.

---

```blade
<input type="checkbox"
        name="active"
        value="active"
        @checked(old('active', $user->active)) />
```

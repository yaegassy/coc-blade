## @readonly

the `@readonly` directive may be used to indicate if a given element should be "readonly":

---

```blade
<input type="email"
        name="email"
        value="email@laravel.com"
        @readonly($user->isNotAdmin()) />
```

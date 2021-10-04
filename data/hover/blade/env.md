# @env

you may determine if the application is running in a specific environment using the `@env` directive:

---

```blade
@env('staging')
    // The application is running in "staging"...
@endenv

@env(['staging', 'production'])
    // The application is running in "staging" or "production"...
@endenv
```

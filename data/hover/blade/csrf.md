# @csrf

Anytime you define an HTML form in your application, you should include a hidden CSRF token field in the form so that the CSRF protection middleware can validate the request. You may use the `@csrf` Blade directive to generate the token field:

---

```blade
<form method="POST" action="/profile">
    @csrf

    ...
</form>
```

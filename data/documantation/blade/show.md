# @show

The `@endsection` directive will only define a section while `@show` will define and immediately yield the section.

`@show` should be used in the parent template.

---

```blade
<html>
    <head>
        <title>App Name - @yield('title')</title>
    </head>
    <body>
        @section('sidebar')
            This is the master sidebar.
        @show

        <div class="container">
            @yield('content')
        </div>
    </body>
</html>
```

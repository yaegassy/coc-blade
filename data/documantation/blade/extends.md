# @extends

When defining a child view, use the `@extends` Blade directive to specify which layout the child view should "inherit".

---

```blade
@extends('layouts.app')

@section('title', 'Page Title')

@section('sidebar')
    @parent

    <p>This is appended to the master sidebar.</p>
@endsection

@section('content')
    <p>This is my body content.</p>
@endsection
```

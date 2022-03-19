# @section

Views which extend a Blade layout may inject content into the layout's sections using `@section` directives.

The `@endsection` directive will only define a section while `@show` will define and immediately yield the section.

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

# @parent

The `@parent` directive will be replaced by the content of the layout when the view is rendered.

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

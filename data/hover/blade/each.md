# @each

You may combine loops and includes into one line with Blade's `@each` directive:

---

```blade
@each('view.name', $jobs, 'job')
```

The `@each` directive's first argument is the view to render for each element in the array or collection. The second argument is the array or collection you wish to iterate over, while the third argument is the variable name that will be assigned to the current iteration within the view. So, for example, if you are iterating over an array of jobs, typically you will want to access each job as a job variable within the view. The array key for the current iteration will be available as the key variable within the view.

You may also pass a fourth argument to the `@each` directive. This argument determines the view that will be rendered if the given array is empty.

```blade
@each('view.name', $jobs, 'job', 'view.empty')
```

export interface BladeHover {
  prefix: string;
  alias: string[];
}

export const bladeHovers: BladeHover[] = [
  {
    prefix: '@json',
    alias: [],
  },
  {
    prefix: '@js',
    alias: [],
  },
  {
    prefix: '@verbatim',
    alias: ['@endverbatim'],
  },
  // ==== Blade Directives ====
  // ---- If Statements ----
  {
    prefix: '@if',
    alias: ['@elseif', '@else', '@endif'],
  },
  {
    prefix: '@unless',
    alias: ['@endunless'],
  },
  {
    prefix: '@isset',
    alias: ['@endisset'],
  },
  {
    prefix: '@empty',
    alias: ['@endempty'],
  },
  // ---- Authentication Directives ----
  {
    prefix: '@auth',
    alias: ['@endauth'],
  },
  {
    prefix: '@guest',
    alias: ['@endguest'],
  },
  // ---- Environment Directives ----
  {
    prefix: '@production',
    alias: ['@endproduction'],
  },
  {
    prefix: '@env',
    alias: ['@endenv'],
  },
  // ---- Section Directives ----
  {
    prefix: '@hasSection',
    alias: [],
  },
  {
    prefix: '@sectionMissing',
    alias: [],
  },
  // ---- Switch Statements ----
  {
    prefix: '@switch',
    alias: ['@case', '@break', '@default', '@endswitch'],
  },
  // ---- Loops ----
  {
    prefix: '@for',
    alias: ['@endfor'],
  },
  {
    prefix: '@foreach',
    alias: ['@endforeach'],
  },
  {
    prefix: '@forelse',
    alias: ['@endforelse'],
  },
  {
    prefix: '@while',
    alias: ['@endwhile'],
  },
  {
    prefix: '@continue',
    alias: [],
  },
  // ---- The Loop Variable ----
  {
    prefix: '$loop',
    alias: ['loop'],
  },
  // ==== 9.x ====
  // ---- Checked / Selected ----
  {
    prefix: '@checked',
    alias: [],
  },
  {
    prefix: '@selected',
    alias: [],
  },
  // ---- Including Subviews ----
  {
    prefix: '@include',
    alias: [],
  },
  {
    prefix: '@includeIf',
    alias: [],
  },
  {
    prefix: '@includeWhen',
    alias: [],
  },
  {
    prefix: '@includeFirst',
    alias: [],
  },
  // ---- Rendering Views For Collections ----
  {
    prefix: '@each',
    alias: [],
  },
  // ---- The @once Directive ----
  {
    prefix: '@once',
    alias: ['@endonce'],
  },
  // ---- Raw PHP ----
  {
    prefix: '@php',
    alias: ['@endphp'],
  },

  // ==== Components ====
  // ---- Data Properties / Attributes ----
  {
    prefix: '@props',
    alias: [],
  },
  // ---- Accessing Parent Data ----
  {
    prefix: '@aware',
    alias: [],
  },
  // ---- 6.x ----
  // https://laravel.com/docs/6.x/blade#components-and-slots
  {
    prefix: '@component',
    alias: ['@endcomponent'],
  },
  // ---- 6.x ----
  // https://laravel.com/docs/6.x/blade#components-and-slots
  {
    prefix: '@slot',
    alias: ['endslot'],
  },
  // ==== Building Layouts ====
  // ---- Layouts Using Template Inheritance ----
  {
    prefix: '@section',
    alias: ['@endsection'],
  },
  {
    prefix: '@show',
    alias: [],
  },
  {
    prefix: '@yield',
    alias: [],
  },
  {
    prefix: '@extends',
    alias: [],
  },
  {
    prefix: '@parent',
    alias: [],
  },
  // ==== Forms ====
  // ---- CSRF Field ----
  {
    prefix: '@csrf',
    alias: [],
  },
  // ---- Method Field ----
  {
    prefix: '@method',
    alias: [],
  },
  // ---- Validation Errors ----
  {
    prefix: '@error',
    alias: ['@enderror'],
  },
  // ==== Stack ====
  {
    prefix: '@push',
    alias: ['@endpush'],
  },
  {
    prefix: '@stack',
    alias: [],
  },
  {
    prefix: '@prepend',
    alias: ['@endprepend'],
  },
  // ==== Service Injection ====
  {
    prefix: '@inject',
    alias: [],
  },
  // ==== authorization ====
  // https://laravel.com/docs/8.x/authorization
  {
    prefix: '@can',
    alias: ['@cannot', '@elsecan', '@endcan', '@elsecannot', '@endcannot'],
  },
  // ==== 7.x ====
  // ---- Localization ----
  // https://laravel.com/docs/7.x/localization#overriding-package-language-files
  {
    prefix: '@lang',
    alias: [],
  },
];

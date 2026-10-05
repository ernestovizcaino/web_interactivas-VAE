@props(['name' => 'book'])
<svg {{ $attributes->merge(['class' => 'size-5 shrink-0']) }} data-ui-icon="{{ $name }}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    @switch($name)
        @case('plus') <path d="M12 5v14M5 12h14"/> @break
        @case('search') <circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/> @break
        @case('clock') <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/> @break
        @case('arrow') <path d="M19 12H5m6-6-6 6 6 6"/> @break
        @case('edit') <path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15v5Z"/> @break
        @case('trash') <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5"/> @break
        @case('check') <path d="m5 12 4 4L19 6"/> @break
        @case('lock') <rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2"/> @break
        @case('chevron') <path d="m9 5 7 7-7 7"/> @break
        @case('sun') <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/> @break
        @case('utensils') <path d="M3 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3Zm0 0v7"/> @break
        @case('moon') <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/> @break
        @case('cake') <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1M2 21h20M7 8v3M12 8v3M17 8v3M7 4h.01M12 4h.01M17 4h.01"/> @break
        @case('cup') <path d="m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8M5 8h14M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0M12 8l1-6h2"/> @break
        @case('chart') <path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/> @break
        @case('leaf') <path d="M20 3C8 1 1 9 5 16s15 2 15-13ZM4 21 15 9"/> @break
        @default <path d="M12 5C8 2 3 4 3 4v15s5-2 9 1c4-3 9-1 9-1V4s-5-2-9 1ZM12 5v15M6 8l3 1M6 12l3 1M15 9l3-1M15 13l3-1"/>
    @endswitch
</svg>

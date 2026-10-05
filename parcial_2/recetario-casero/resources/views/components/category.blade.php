@props(['value'])
<span {{ $attributes->merge(['class' => 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold capitalize text-foreground']) }} style="background: var(--cat-{{ $value }}, var(--muted))">{{ $value }}</span>

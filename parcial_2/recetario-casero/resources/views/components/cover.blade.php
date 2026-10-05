@props(['categoria'])
@php($iconos = ['desayuno' => 'sun', 'almuerzo' => 'utensils', 'cena' => 'moon', 'postre' => 'cake', 'bebida' => 'cup'])
<div {{ $attributes->merge(['class' => 'flex items-center justify-center']) }} style="background: var(--cat-{{ $categoria }}, var(--muted))" aria-hidden="true">
    <x-icon :name="$iconos[$categoria] ?? 'book'" class="size-12! text-foreground/75" stroke-width="1.4"/>
</div>

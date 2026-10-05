@extends('layouts.app')
@section('title', 'Mis recetas')
@section('content')
<div class="mb-8 flex flex-wrap items-end justify-between gap-6">
    <div>
        <h1 class="text-5xl font-black tracking-tighter sm:text-6xl">Mis recetas</h1>
        <p class="mt-3 text-sm font-medium text-muted-foreground">{{ $totalRecetas }} {{ $totalRecetas === 1 ? 'receta guardada' : 'recetas guardadas' }}</p>
    </div>
    <a href="{{ route('recetas.create') }}" class="btn-primary"><x-icon name="plus" class="size-4"/> Nueva receta</a>
</div>

<form method="GET" action="{{ route('recetas.index') }}" class="mb-5 flex gap-3" role="search">
    @if($categoria !== '')
        <input type="hidden" name="categoria" value="{{ $categoria }}">
    @endif
    <div class="relative flex-1">
        <label for="buscar" class="sr-only">Buscar por título</label>
        <input class="search-field" id="buscar" name="buscar" type="search" value="{{ $buscar }}" placeholder="¿Qué te gustaría cocinar?" maxlength="150">
        <x-icon name="search" class="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-muted-foreground"/>
    </div>
    <button type="submit" class="btn-primary">Buscar</button>
</form>
<x-field-error name="buscar"/>
<x-field-error name="categoria"/>

<nav class="mb-10 flex flex-wrap items-center gap-2" aria-label="Filtrar por categoría">
    <a href="{{ route('recetas.index', array_filter(['buscar' => $buscar])) }}" class="chip" aria-current="{{ $categoria === '' ? 'true' : 'false' }}">Todas</a>
    @foreach($categorias as $opcion)
        <a href="{{ route('recetas.index', array_filter(['buscar' => $buscar, 'categoria' => $opcion])) }}" class="chip capitalize" aria-current="{{ $categoria === $opcion ? 'true' : 'false' }}">
            <span class="size-2.5 rounded-full" style="background: var(--cat-{{ $opcion }})" aria-hidden="true"></span>{{ $opcion }}
        </a>
    @endforeach
    @if($buscar !== '' || $categoria !== '')
        <a href="{{ route('recetas.index') }}" class="ml-1 text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Limpiar</a>
    @endif
</nav>

<section aria-label="Tu colección">
    @if($recetas->isEmpty())
        <div class="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border px-6 py-16 text-center" data-ui-empty>
            <x-icon name="{{ $totalRecetas === 0 ? 'book' : 'search' }}" class="size-8"/>
            <h3 class="text-xl font-semibold tracking-tight">{{ $totalRecetas === 0 ? 'Tu próxima receta empieza aquí.' : 'No encontramos recetas.' }}</h3>
            <p class="max-w-sm text-sm leading-6 text-muted-foreground">{{ $totalRecetas === 0 ? 'Aún no tienes recetas. Guarda ese plato que te encanta y empieza a llenar tu recetario.' : 'Prueba otro título o limpia los filtros.' }}</p>
            <a href="{{ $totalRecetas === 0 ? route('recetas.create') : route('recetas.index') }}" class="btn-secondary">{{ $totalRecetas === 0 ? 'Guardar mi primera receta' : 'Ver todas mis recetas' }}</a>
        </div>
    @else
        <ul class="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            @foreach($recetas as $receta)
                <li class="group relative">
                    <a href="{{ route('recetas.show', $receta) }}" class="block rounded-2xl focus-visible:outline-offset-4">
                        <x-cover :categoria="$receta->categoria" class="aspect-[4/3] overflow-hidden rounded-2xl transition-transform duration-300 ease-out group-hover:scale-[1.02]"/>
                        <h2 class="mt-4 text-xl leading-snug font-extrabold tracking-tight wrap-break-word group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">{{ $receta->titulo }}</h2>
                    </a>
                    <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
                        <x-category :value="$receta->categoria"/>
                        <span class="flex items-center gap-1 tabular-nums"><x-icon name="clock" class="size-4"/>{{ $receta->tiempo_minutos }} min</span>
                        <span class="capitalize">{{ $receta->dificultad }}</span>
                    </div>
                    <div class="absolute top-3 right-3 rounded-full bg-background/90 shadow-sm backdrop-blur">
                        <div class="flex gap-2" data-ui-recipe-actions data-recipe-title="{{ $receta->titulo }}">
                            <a href="{{ route('recetas.show', $receta) }}" data-action="show" class="sr-only">Ver {{ $receta->titulo }}</a>
                            <a href="{{ route('recetas.edit', $receta) }}" data-action="edit" class="px-2 text-xs" aria-label="Editar {{ $receta->titulo }}">Editar</a>
                            <a href="{{ route('recetas.show', ['receta' => $receta, 'confirmar' => 'eliminar']) }}" data-action="delete" class="px-2 text-xs text-destructive" aria-label="Eliminar {{ $receta->titulo }}">Eliminar</a>
                        </div>
                    </div>
                </li>
            @endforeach
        </ul>
        @if($recetas->hasPages())
            <nav class="mt-14 flex items-center justify-center gap-3 text-sm font-semibold" aria-label="Paginación">
                @if($recetas->onFirstPage()) <span class="chip opacity-40">Anterior</span> @else <a href="{{ $recetas->previousPageUrl() }}" class="chip">Anterior</a> @endif
                <span class="px-2 text-muted-foreground tabular-nums">Página {{ $recetas->currentPage() }} de {{ $recetas->lastPage() }}</span>
                @if($recetas->hasMorePages()) <a href="{{ $recetas->nextPageUrl() }}" class="chip">Siguiente</a> @else <span class="chip opacity-40">Siguiente</span> @endif
            </nav>
        @endif
    @endif
</section>
@endsection

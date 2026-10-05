@extends('layouts.app')
@section('title', $receta->titulo)
@section('content')
<a href="{{ route('recetas.index') }}" class="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><x-icon name="arrow" class="size-4"/> Mis recetas</a>
<div class="grid items-end gap-8 lg:grid-cols-[1fr_380px]">
    <div class="min-w-0">
        <x-category :value="$receta->categoria"/>
        <h1 class="mt-4 text-5xl leading-[1.02] font-black tracking-tighter wrap-break-word sm:text-6xl">{{ $receta->titulo }}</h1>
        <div class="mt-6 flex flex-wrap gap-3">
            <a href="{{ route('recetas.edit', $receta) }}" class="btn-secondary"><x-icon name="edit" class="size-4"/> Editar</a>
            <a href="{{ route('recetas.show', ['receta' => $receta, 'confirmar' => 'eliminar']) }}" class="btn-secondary" data-ui-variant="destructive"><x-icon name="trash" class="size-4"/> Eliminar</a>
        </div>
    </div>
    <x-cover :categoria="$receta->categoria" class="hidden aspect-[4/3] rounded-3xl lg:flex"/>
</div>

<dl class="mt-10 grid grid-cols-3 divide-x divide-border rounded-2xl bg-muted py-5 text-center">
    <div><dt class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Tiempo</dt><dd class="mt-1 text-lg font-extrabold tabular-nums">{{ $receta->tiempo_minutos }} min</dd></div>
    <div><dt class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Dificultad</dt><dd class="mt-1 text-lg font-extrabold capitalize">{{ $receta->dificultad }}</dd></div>
    <div><dt class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Ingredientes</dt><dd class="mt-1 text-lg font-extrabold tabular-nums">{{ count($receta->listaIngredientes()) }}</dd></div>
</dl>

<div class="mt-12 grid items-start gap-12 lg:grid-cols-[340px_1fr] lg:gap-16">
    <section>
        <h2 class="text-3xl font-black tracking-tighter">Ingredientes</h2>
        <ul class="mt-5 divide-y divide-border border-y border-border text-[15px] leading-6">
            @foreach($receta->listaIngredientes() as $ingrediente)
                <li class="py-3.5 whitespace-pre-wrap wrap-break-word">{{ $ingrediente }}</li>
            @endforeach
        </ul>
    </section>
    <section>
        <h2 class="text-3xl font-black tracking-tighter">Preparación</h2>
        <ol class="mt-5 flex flex-col gap-8">
            @foreach($receta->listaPasos() as $paso)
                <li class="flex items-start gap-5">
                    <span class="w-8 shrink-0 text-3xl leading-none font-black tracking-tighter text-brand tabular-nums" aria-hidden="true">{{ $loop->iteration }}</span>
                    <p class="min-w-0 text-[15px] leading-7 whitespace-pre-wrap wrap-break-word">{{ $paso }}</p>
                </li>
            @endforeach
        </ol>
        @if($receta->nota_personal !== null && $receta->nota_personal !== '')
            <aside class="mt-12 rounded-2xl bg-accent p-7">
                <h2 class="text-lg font-extrabold tracking-tight">Mi nota personal</h2>
                <p class="mt-3 text-[15px] leading-7 whitespace-pre-wrap wrap-break-word">{{ $receta->nota_personal }}</p>
            </aside>
        @endif
    </section>
</div>
@endsection

@extends('layouts.app')
@section('title', 'Eliminar receta')
@section('content')
<section class="mx-auto max-w-lg rounded-3xl bg-muted p-8 text-center sm:mt-8 sm:p-12">
    <span class="mx-auto flex size-16 items-center justify-center rounded-full bg-background text-destructive"><x-icon name="trash" class="size-7"/></span>
    <h1 class="mt-6 text-3xl font-black tracking-tighter">¿Eliminar esta receta?</h1>
    <p class="mt-4 text-sm leading-7 text-muted-foreground">Vas a eliminar <strong class="wrap-break-word text-foreground">{{ $receta->titulo }}</strong> de tu recetario. Esta acción no se puede deshacer.</p>
    <form method="POST" action="{{ route('recetas.destroy', $receta) }}" class="mt-8 flex flex-wrap justify-center gap-3">
        @csrf
        @method('DELETE')
        <a href="{{ route('recetas.show', $receta) }}" class="btn-secondary">Conservar receta</a>
        <button type="submit" class="btn-primary" data-ui-variant="destructive">Sí, eliminar receta</button>
    </form>
</section>
@endsection

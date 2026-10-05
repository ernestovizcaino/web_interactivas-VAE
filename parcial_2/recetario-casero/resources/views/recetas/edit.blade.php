@extends('layouts.app')
@section('title', 'Editar receta')
@section('content')
<a href="{{ route('recetas.show', $receta) }}" class="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><x-icon name="arrow" class="size-4"/> Volver a la receta</a>
<h1 class="text-5xl font-black tracking-tighter">Editar receta</h1>
<form method="POST" action="{{ route('recetas.update', $receta) }}" class="mt-10" data-submit-once novalidate>
    @csrf
    @method('PUT')
    @include('recetas.form')
</form>
@endsection

@extends('layouts.app')
@section('title', 'Nueva receta')
@section('content')
<a href="{{ route('recetas.index') }}" class="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><x-icon name="arrow" class="size-4"/> Mis recetas</a>
<h1 class="text-5xl font-black tracking-tighter">Nueva receta</h1>
<form method="POST" action="{{ route('recetas.store') }}" class="mt-10" data-submit-once novalidate>
    @csrf
    @include('recetas.form')
</form>
@endsection

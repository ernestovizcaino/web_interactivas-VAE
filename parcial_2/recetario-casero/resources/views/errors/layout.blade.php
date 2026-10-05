@extends('layouts.app')
@section('title', 'Algo ocurrió')
@section('content')
<section class="mx-auto max-w-lg py-16 text-center">
    <p class="text-sm font-bold text-brand">@yield('code')</p>
    <h1 class="mt-3 text-4xl font-black tracking-tighter">@yield('heading')</h1>
    <p class="mt-4 text-sm leading-7 text-muted-foreground">@yield('message')</p>
    <a href="{{ route('home') }}" class="btn-secondary mt-7">Volver al inicio</a>
</section>
@endsection

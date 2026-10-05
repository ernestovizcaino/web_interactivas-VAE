@extends('layouts.app')
@section('title', 'Iniciar sesión')
@section('content')
<div class="mx-auto max-w-md">
    <section class="flex items-center py-4 ">
        <div class="mx-auto w-full max-w-md">
            <h1 class="text-4xl font-black tracking-tighter">Inicia sesión</h1>
            <form method="POST" action="{{ route('login.store') }}" class="mt-8 flex flex-col gap-5" novalidate>
                @csrf
                <div>
                    <label class="field-label" for="email">Correo electrónico</label>
                    <input class="field" id="email" name="email" type="email" autocomplete="email" value="{{ old('email') }}" placeholder="tu@correo.com" required aria-invalid="{{ $errors->has('email') ? 'true' : 'false' }}" @if($errors->has('email')) aria-describedby="email-error" @endif>
                    <x-field-error name="email"/>
                </div>
                <div>
                    <label class="field-label" for="password">Contraseña</label>
                    <input class="field" id="password" name="password" type="password" autocomplete="current-password" required aria-invalid="{{ $errors->has('password') ? 'true' : 'false' }}" @if($errors->has('password')) aria-describedby="password-error" @endif>
                    <x-field-error name="password"/>
                </div>
                <label class="flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" name="remember" value="1" class="size-4 accent-brand" @checked(old('remember'))> Recordarme
                </label>
                <button type="submit" class="btn-primary w-full">Iniciar sesión</button>
            </form>
            <p class="mt-7 text-center text-sm text-muted-foreground">¿Es tu primera vez? <a href="{{ route('register') }}" class="font-bold text-foreground underline underline-offset-4 hover:underline">Crea tu cuenta</a></p>
        </div>
    </section>
</div>
@endsection

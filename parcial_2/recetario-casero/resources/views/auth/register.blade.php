@extends('layouts.app')
@section('title', 'Crear cuenta')
@section('content')
<div class="mx-auto max-w-md">
    <section class="flex items-center ">
        <div class="mx-auto w-full max-w-md">
            <h1 class="text-4xl font-black tracking-tighter">Crea tu cuenta</h1>
            <form method="POST" action="{{ route('register.store') }}" class="mt-7 flex flex-col gap-4" novalidate>
                @csrf
                <div>
                    <label class="field-label" for="name">Nombre</label>
                    <input class="field" id="name" name="name" autocomplete="name" value="{{ old('name') }}" maxlength="100" placeholder="¿Cómo te llamas?" required aria-invalid="{{ $errors->has('name') ? 'true' : 'false' }}" @if($errors->has('name')) aria-describedby="name-error" @endif>
                    <x-field-error name="name"/>
                </div>
                <div>
                    <label class="field-label" for="email">Correo electrónico</label>
                    <input class="field" id="email" name="email" type="email" autocomplete="email" value="{{ old('email') }}" placeholder="tu@correo.com" required aria-invalid="{{ $errors->has('email') ? 'true' : 'false' }}" @if($errors->has('email')) aria-describedby="email-error" @endif>
                    <x-field-error name="email"/>
                </div>
                <div>
                    <label class="field-label" for="password">Contraseña</label>
                    <input class="field" id="password" name="password" type="password" autocomplete="new-password" placeholder="Al menos 8 caracteres" required aria-invalid="{{ $errors->has('password') ? 'true' : 'false' }}" @if($errors->has('password')) aria-describedby="password-error" @endif>
                                        <x-field-error name="password"/>
                </div>
                <div>
                    <label class="field-label" for="password_confirmation">Confirmar contraseña</label>
                    <input class="field" id="password_confirmation" name="password_confirmation" type="password" autocomplete="new-password" required aria-invalid="{{ $errors->has('password_confirmation') ? 'true' : 'false' }}" @if($errors->has('password_confirmation')) aria-describedby="password_confirmation-error" @endif>
                    <x-field-error name="password_confirmation"/>
                </div>
                <button type="submit" class="btn-primary w-full">Crear mi cuenta</button>
            </form>
            <p class="mt-6 text-center text-sm text-muted-foreground">¿Ya tienes una cuenta? <a href="{{ route('login') }}" class="font-bold text-foreground underline underline-offset-4 hover:underline">Inicia sesión</a></p>
        </div>
    </section>
</div>
@endsection

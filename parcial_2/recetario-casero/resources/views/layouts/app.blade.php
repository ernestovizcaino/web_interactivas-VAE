<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#ffffff">
    <title>@yield('title', 'Mis recetas') · Recetario casero</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body class="flex min-h-screen flex-col">
    <a href="#contenido" class="sr-only rounded-lg bg-background p-3 focus:not-sr-only focus:absolute focus:z-50">Saltar al contenido</a>
    <header class="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
            <a href="{{ auth()->check() ? route('recetas.index') : route('home') }}" class="text-2xl font-black tracking-tighter" aria-label="Recetario casero, inicio">
                recetario<span class="text-brand">.</span>
            </a>
            @auth
                <nav class="flex items-center gap-2 text-sm sm:gap-4" aria-label="Navegación principal">
                    <span class="hidden max-w-40 truncate font-medium text-muted-foreground sm:block">{{ auth()->user()->name }}</span>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit" class="btn-secondary" data-ui-variant="ghost" data-ui-size="sm">Cerrar sesión</button>
                    </form>
                </nav>
            @endauth
        </div>
    </header>
    <main id="contenido" class="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        @if (session('success'))
            <div class="mb-7 rounded-lg border border-border bg-muted p-4 text-sm" role="status" data-ui-alert>
                <x-icon name="check" class="size-4"/>
                <p>{{ session('success') }}</p>
            </div>
        @endif
        @yield('content')
    </main>
</body>
</html>

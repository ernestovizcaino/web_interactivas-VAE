<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\RecetaController;
use App\Models\Receta;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => auth()->check() ? to_route('recetas.index') : view('auth.login'))->name('home');

Route::middleware('guest')->group(function (): void {
    Route::get('/iniciar-sesion', [AuthController::class, 'loginForm'])->name('login');
    Route::post('/iniciar-sesion', [AuthController::class, 'login'])->name('login.store');
    Route::get('/registro', [AuthController::class, 'registerForm'])->name('register');
    Route::post('/registro', [AuthController::class, 'register'])->middleware('throttle:registro')->name('register.store');
});

/** El enlace resuelve únicamente recetas del usuario, incluso al abrir una URL directa. */
Route::bind('receta', function (string $id): Receta {
    abort_unless(auth()->check(), 404);

    return request()->user()->recetas()->findOrFail($id);
});

Route::middleware('auth')->group(function (): void {
    Route::post('/cerrar-sesion', [AuthController::class, 'logout'])->name('logout');
    Route::resource('recetas', RecetaController::class)->parameters(['recetas' => 'receta']);
});

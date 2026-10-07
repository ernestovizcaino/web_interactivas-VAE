<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\InscripcionController;
use App\Http\Controllers\TorneoController;
use Illuminate\Support\Facades\Route;

// Consulta pública
Route::get('/', fn () => to_route('torneos.index'))->name('home');
Route::get('torneos', [TorneoController::class, 'index'])->name('torneos.index');
Route::get('torneos/{torneo}', [TorneoController::class, 'show'])->whereNumber('torneo')->name('torneos.show');

// Jugador
Route::middleware('role:jugador')->group(function () {
    Route::get('mis-torneos', [InscripcionController::class, 'index'])->name('mis-torneos');
    Route::post('torneos/{torneo}/inscripcion', [InscripcionController::class, 'store'])->name('inscripciones.store');
    Route::delete('torneos/{torneo}/inscripcion', [InscripcionController::class, 'destroy'])->name('inscripciones.destroy');
});

// Administrador
Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
    Route::resource('torneos', Admin\TorneoController::class);
    Route::delete('torneos/{torneo}/inscripciones/{inscripcion}', [Admin\InscripcionController::class, 'destroy'])
        ->name('inscripciones.destroy');
});

Route::get('dashboard', function () {
    return auth()->user()?->isAdmin()
        ? to_route('admin.torneos.index')
        : to_route('torneos.index');
})->middleware('auth')->name('dashboard');

require __DIR__.'/settings.php';

<?php

use App\Models\Torneo;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('listing only shows open, future tournaments with free spots ordered by date', function () {
    $tarde = Torneo::factory()->create(['fecha' => now()->addDays(10)]);
    $pronto = Torneo::factory()->create(['fecha' => now()->addDays(2)]);
    Torneo::factory()->cerrado()->create();
    Torneo::factory()->pasado()->create();
    $lleno = Torneo::factory()->create(['cupo' => 2]);
    $lleno->jugadores()->attach(User::factory(2)->create());

    $this->get(route('torneos.index'))->assertInertia(fn (Assert $page) => $page
        ->component('torneos/index')
        ->has('torneos', 2)
        ->where('torneos.0.id', $pronto->id)
        ->where('torneos.1.id', $tarde->id));

    // Lo lleno sigue accesible por detalle directo.
    $this->get(route('torneos.show', $lleno))->assertOk();
});

test('player can enroll once', function () {
    $torneo = Torneo::factory()->create();
    $jugador = User::factory()->create();

    $this->actingAs($jugador)->post(route('inscripciones.store', $torneo))
        ->assertInertiaFlash('toast.type', 'success');

    $this->actingAs($jugador)->post(route('inscripciones.store', $torneo))
        ->assertInertiaFlash('toast.message', 'Ya estás inscrito en este torneo.');

    expect($torneo->inscripciones()->count())->toBe(1);
});

test('player can not enroll in full, closed or past tournaments', function () {
    $jugador = User::factory()->create();
    $lleno = Torneo::factory()->create(['cupo' => 2]);
    $lleno->jugadores()->attach(User::factory(2)->create());

    $this->actingAs($jugador)->post(route('inscripciones.store', $lleno))
        ->assertInertiaFlash('toast.message', 'El torneo está lleno: no quedan plazas disponibles.');

    $this->actingAs($jugador)->post(route('inscripciones.store', Torneo::factory()->cerrado()->create()))
        ->assertInertiaFlash('toast.message', 'Las inscripciones de este torneo están cerradas.');

    $this->actingAs($jugador)->post(route('inscripciones.store', Torneo::factory()->pasado()->create()))
        ->assertInertiaFlash('toast.type', 'error');

    expect($jugador->inscripciones()->count())->toBe(0);
});

test('player sees their tournaments and can cancel to free the spot', function () {
    $torneo = Torneo::factory()->create(['cupo' => 2]);
    $jugador = User::factory()->create();
    $torneo->jugadores()->attach([$jugador->id, User::factory()->create()->id]);

    expect($torneo->fresh()->estaLleno())->toBeTrue();

    $this->actingAs($jugador)->get(route('mis-torneos'))
        ->assertInertia(fn (Assert $page) => $page->component('torneos/mis-torneos')->has('inscripciones', 1));

    $this->actingAs($jugador)->delete(route('inscripciones.destroy', $torneo))
        ->assertInertiaFlash('toast.type', 'success');

    expect($torneo->fresh()->estaLleno())->toBeFalse();
});

test('player can not cancel after the tournament date', function () {
    $torneo = Torneo::factory()->pasado()->create();
    $jugador = User::factory()->create();
    $torneo->jugadores()->attach($jugador);

    $this->actingAs($jugador)->delete(route('inscripciones.destroy', $torneo))
        ->assertInertiaFlash('toast.type', 'error');

    expect($torneo->inscripciones()->count())->toBe(1);
});

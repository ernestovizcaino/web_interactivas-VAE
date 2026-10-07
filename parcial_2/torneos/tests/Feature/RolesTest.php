<?php

use App\Enums\Role;
use App\Models\Torneo;
use App\Models\User;

test('registration creates a jugador account', function () {
    $this->post(route('register.store'), [
        'name' => 'Nuevo Jugador',
        'email' => 'nuevo@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    expect(User::firstWhere('email', 'nuevo@example.com')->role)->toBe(Role::Jugador);
});

test('guests are redirected to login from admin routes', function () {
    $this->get(route('admin.torneos.index'))
        ->assertRedirect(route('login'))
        ->assertInertiaFlash('toast.type', 'error');
});

test('players are redirected with a warning from admin routes', function () {
    $torneo = Torneo::factory()->create();

    $this->actingAs(User::factory()->create());

    $this->get(route('admin.torneos.index'))->assertRedirect(route('torneos.index'));
    $this->get(route('admin.torneos.create'))->assertRedirect(route('torneos.index'));
    $this->delete(route('admin.torneos.destroy', $torneo))->assertRedirect(route('torneos.index'));

    expect(Torneo::count())->toBe(1);
});

test('admins can not enroll in tournaments', function () {
    $torneo = Torneo::factory()->create();

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('inscripciones.store', $torneo))
        ->assertRedirect(route('torneos.index'));

    expect($torneo->inscripciones()->count())->toBe(0);
});

test('guests can browse tournaments', function () {
    $torneo = Torneo::factory()->create();

    $this->get(route('torneos.index'))->assertOk();
    $this->get(route('torneos.show', $torneo))->assertOk();
});

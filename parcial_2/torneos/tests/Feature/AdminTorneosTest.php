<?php

use App\Models\Inscripcion;
use App\Models\Torneo;
use App\Models\User;

beforeEach(function () {
    $this->actingAs(User::factory()->admin()->create());
});

function datosTorneo(array $cambios = []): array
{
    return [
        'nombre' => 'Copa de prueba',
        'juego' => 'Fútbol',
        'fecha' => now()->addWeek()->format('Y-m-d\TH:i'),
        'cupo' => 16,
        'descripcion' => null,
        'estado' => 'abierto',
        ...$cambios,
    ];
}

test('admin can create a tournament', function () {
    $this->post(route('admin.torneos.store'), datosTorneo())
        ->assertRedirect(route('admin.torneos.index'))
        ->assertInertiaFlash('toast.type', 'success');

    expect(Torneo::firstWhere('nombre', 'Copa de prueba'))->not->toBeNull();
});

test('tournament validation errors are in spanish', function () {
    $this->post(route('admin.torneos.store'), datosTorneo([
        'nombre' => '',
        'juego' => '',
        'fecha' => now()->subDay()->format('Y-m-d\TH:i'),
        'cupo' => 1,
        'estado' => 'otro',
    ]))->assertSessionHasErrors([
        'nombre' => 'El nombre del torneo es obligatorio.',
        'juego' => 'Indica el juego o deporte del torneo.',
        'fecha' => 'La fecha del torneo debe ser futura.',
        'cupo' => 'El cupo mínimo es de 2 jugadores.',
        'estado' => 'El estado debe ser abierto o cerrado.',
    ]);

    $this->post(route('admin.torneos.store'), datosTorneo(['cupo' => 101]))
        ->assertSessionHasErrors(['cupo' => 'El cupo máximo es de 100 jugadores.']);
});

test('cupo can not be lowered below enrolled players', function () {
    $torneo = Torneo::factory()->create(['cupo' => 10]);
    $torneo->jugadores()->attach(User::factory(5)->create());

    $this->put(route('admin.torneos.update', $torneo), datosTorneo(['cupo' => 4]))
        ->assertSessionHasErrors(['cupo' => 'El cupo no puede ser menor a 5: ya hay 5 jugadores inscritos.']);

    $this->put(route('admin.torneos.update', $torneo), datosTorneo(['cupo' => 5]))
        ->assertSessionHasNoErrors();

    expect($torneo->fresh()->cupo)->toBe(5);
});

test('deleting a tournament cascades its enrollments', function () {
    $torneo = Torneo::factory()->create();
    $torneo->jugadores()->attach(User::factory(3)->create());

    $this->delete(route('admin.torneos.destroy', $torneo))->assertRedirect(route('admin.torneos.index'));

    expect(Torneo::count())->toBe(0)
        ->and(Inscripcion::count())->toBe(0);
});

test('admin can remove any enrollment', function () {
    $torneo = Torneo::factory()->create();
    $torneo->jugadores()->attach(User::factory()->create());
    $inscripcion = $torneo->inscripciones()->first();

    $this->get(route('admin.torneos.show', $torneo))->assertOk();

    $this->delete(route('admin.inscripciones.destroy', [$torneo, $inscripcion]))
        ->assertInertiaFlash('toast.type', 'success');

    expect($torneo->inscripciones()->count())->toBe(0);
});

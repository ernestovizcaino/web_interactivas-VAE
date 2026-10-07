<?php

namespace Database\Seeders;

use App\Models\Torneo;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Crea las cuentas demo y torneos de ejemplo.
     */
    public function run(): void
    {
        User::factory()->admin()->create([
            'name' => 'Administrador',
            'email' => 'admin@torneos.test',
        ]);

        $jugador = User::factory()->create([
            'name' => 'Jugador Demo',
            'email' => 'jugador@torneos.test',
        ]);

        $otros = User::factory(15)->create();

        $copa = Torneo::factory()->create([
            'nombre' => 'Copa Universitaria de Fútbol 7',
            'juego' => 'Fútbol',
            'fecha' => now()->addDays(5)->setTime(17, 0),
            'cupo' => 14,
            'descripcion' => 'Torneo relámpago de fútbol 7 en la cancha principal. Trae tenis y muchas ganas.',
        ]);
        $copa->jugadores()->attach([$jugador->id, ...$otros->take(9)->pluck('id')]);

        Torneo::factory()->create([
            'nombre' => 'Liga 3x3 de Básquetbol',
            'juego' => 'Básquetbol',
            'fecha' => now()->addDays(9)->setTime(16, 30),
            'cupo' => 12,
            'descripcion' => 'Partidos de 10 minutos o a 21 puntos. Equipos armados el día del evento.',
        ])->jugadores()->attach($otros->take(4)->pluck('id'));

        Torneo::factory()->create([
            'nombre' => 'Valorant Showdown',
            'juego' => 'Valorant',
            'fecha' => now()->addDays(14)->setTime(19, 0),
            'cupo' => 20,
            'descripcion' => 'Competencia en línea, formato suizo. Se requiere cuenta de Riot activa.',
        ])->jugadores()->attach($otros->slice(4, 6)->pluck('id'));

        Torneo::factory()->create([
            'nombre' => 'Abierto de Ajedrez Rápido',
            'juego' => 'Ajedrez',
            'fecha' => now()->addDays(21)->setTime(10, 0),
            'cupo' => 32,
            'descripcion' => 'Partidas de 10 + 5. Tableros proporcionados por la organización.',
        ]);

        Torneo::factory()->create([
            'nombre' => 'Torneo FIFA 26',
            'juego' => 'FIFA 26',
            'fecha' => now()->addDays(3)->setTime(18, 0),
            'cupo' => 16,
            'descripcion' => 'Eliminación directa en PS5. Controles disponibles en sitio.',
        ]);

        // Lleno: no aparece en el listado, solo por detalle directo.
        Torneo::factory()->create([
            'nombre' => 'Mini torneo de Ping Pong',
            'juego' => 'Tenis de mesa',
            'fecha' => now()->addDays(7)->setTime(12, 0),
            'cupo' => 4,
        ])->jugadores()->attach($otros->slice(10, 4)->pluck('id'));

        // Cerrado por el admin.
        Torneo::factory()->cerrado()->create([
            'nombre' => 'Voleibol Mixto (cerrado)',
            'juego' => 'Voleibol',
            'fecha' => now()->addDays(10)->setTime(15, 0),
            'cupo' => 24,
        ]);

        // Fecha pasada.
        Torneo::factory()->pasado()->create([
            'nombre' => 'Rocket League Cup (finalizado)',
            'juego' => 'Rocket League',
            'cupo' => 8,
        ])->jugadores()->attach([$jugador->id, ...$otros->take(3)->pluck('id')]);
    }
}

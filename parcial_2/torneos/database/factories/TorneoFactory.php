<?php

namespace Database\Factories;

use App\Enums\EstadoTorneo;
use App\Models\Torneo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Torneo>
 */
class TorneoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => 'Copa '.fake()->unique()->city(),
            'juego' => fake()->randomElement(['Fútbol', 'Básquetbol', 'Voleibol', 'FIFA 26', 'Valorant', 'Ajedrez']),
            'fecha' => now()->addDays(fake()->numberBetween(3, 60))->setTime(18, 0),
            'cupo' => 16,
            'descripcion' => fake()->sentence(12),
            'estado' => EstadoTorneo::Abierto,
        ];
    }

    public function cerrado(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => EstadoTorneo::Cerrado,
        ]);
    }

    public function pasado(): static
    {
        return $this->state(fn (array $attributes) => [
            'fecha' => now()->subDays(3),
        ]);
    }
}

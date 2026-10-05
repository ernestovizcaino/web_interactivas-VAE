<?php

namespace Database\Factories;

use App\Models\Receta;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Receta> */
class RecetaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'titulo' => fake()->sentence(4),
            'categoria' => fake()->randomElement(Receta::CATEGORIAS),
            'tiempo_minutos' => fake()->numberBetween(5, 120),
            'dificultad' => fake()->randomElement(Receta::DIFICULTADES),
            'ingredientes' => "2 tazas de harina\n1 huevo\nUna pizca de sal",
            'pasos' => "Mezclar los ingredientes.\nCocinar a fuego medio.\nServir.",
            'nota_personal' => null,
        ];
    }
}

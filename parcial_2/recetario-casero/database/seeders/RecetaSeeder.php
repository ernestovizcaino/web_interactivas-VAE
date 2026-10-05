<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class RecetaSeeder extends Seeder
{
    /** Datos de demostración opcionales para desarrollo local. */
    public function run(): void
    {
        $usuario = User::firstOrCreate(
            ['email' => 'demo@recetario.test'],
            ['name' => 'Cocina de prueba', 'password' => 'Cocina123!'],
        );

        $recetas = [
            [
                'titulo' => 'Chilaquiles verdes', 'categoria' => 'desayuno',
                'tiempo_minutos' => 25, 'dificultad' => 'fácil',
                'ingredientes' => "8 tortillas de maíz\n6 tomates verdes\n1 chile serrano\n¼ de cebolla\n1 diente de ajo\nCrema y queso al gusto",
                'pasos' => "Cuece los tomates y el chile durante 10 minutos.\nLicúa con la cebolla, el ajo y una pizca de sal.\nCorta las tortillas en triángulos y fríelas.\nCalienta la salsa e incorpora las tortillas.\nSirve con crema y queso.",
                'nota_personal' => 'Agrega las tortillas al final para que conserven su textura.',
            ],
            [
                'titulo' => 'Sopa de tortilla', 'categoria' => 'almuerzo',
                'tiempo_minutos' => 40, 'dificultad' => 'media',
                'ingredientes' => "4 jitomates\n1 diente de ajo\n1 litro de caldo\n6 tortillas\n1 aguacate\nQueso fresco",
                'pasos' => "Asa los jitomates y el ajo.\nLicúa con una taza de caldo.\nVierte en una olla y agrega el resto del caldo.\nCocina durante 20 minutos.\nFríe las tortillas cortadas en tiras.\nSirve con las tiras, el aguacate y el queso.",
                'nota_personal' => 'Un poco de chile pasilla le da un sabor especial.',
            ],
            [
                'titulo' => 'Quesadillas de champiñones', 'categoria' => 'cena',
                'tiempo_minutos' => 20, 'dificultad' => 'fácil',
                'ingredientes' => "4 tortillas\n200 g de champiñones\n150 g de queso Oaxaca\n¼ de cebolla\n1 cucharada de aceite",
                'pasos' => "Pica la cebolla y rebana los champiñones.\nSaltea ambos en aceite hasta que estén suaves.\nRellena las tortillas con queso y champiñones.\nCalienta en un comal hasta que el queso se derrita.",
                'nota_personal' => null,
            ],
            [
                'titulo' => 'Arroz con leche y canela', 'categoria' => 'postre',
                'tiempo_minutos' => 45, 'dificultad' => 'fácil',
                'ingredientes' => "1 taza de arroz\n2 tazas de agua\n3 tazas de leche\n½ taza de azúcar\n1 rama de canela",
                'pasos' => "Lava el arroz.\nCuece con el agua y la canela hasta que esté suave.\nAgrega la leche y el azúcar.\nCocina a fuego bajo, removiendo, hasta que espese.\nSirve tibio o frío con canela.",
                'nota_personal' => 'Mi favorito para una tarde de lluvia.',
            ],
            [
                'titulo' => 'Agua de limón con hierbabuena', 'categoria' => 'bebida',
                'tiempo_minutos' => 10, 'dificultad' => 'fácil',
                'ingredientes' => "4 limones\n1 litro de agua\n6 hojas de hierbabuena\nAzúcar al gusto\nHielo",
                'pasos' => "Exprime los limones.\nMezcla el jugo con el agua y el azúcar.\nAgrega las hojas de hierbabuena y deja reposar.\nSirve con hielo.",
                'nota_personal' => null,
            ],
        ];

        foreach ($recetas as $receta) {
            $usuario->recetas()->updateOrCreate(['titulo' => $receta['titulo']], $receta);
        }
    }
}

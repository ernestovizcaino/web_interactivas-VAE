<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['titulo', 'categoria', 'tiempo_minutos', 'dificultad', 'ingredientes', 'pasos', 'nota_personal'])]
class Receta extends Model
{
    use HasFactory;

    public const CATEGORIAS = ['desayuno', 'almuerzo', 'cena', 'postre', 'bebida'];

    public const DIFICULTADES = ['fácil', 'media', 'difícil'];

    protected $table = 'recetas';

    protected function casts(): array
    {
        return ['tiempo_minutos' => 'integer'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return list<string> */
    public function listaIngredientes(): array
    {
        return $this->lineas($this->ingredientes);
    }

    /** @return list<string> */
    public function listaPasos(): array
    {
        return $this->lineas($this->pasos);
    }

    /** @return list<string> */
    private function lineas(string $texto): array
    {
        return array_values(array_filter(
            array_map('trim', preg_split('/\R/u', $texto)),
            fn (string $linea): bool => $linea !== '',
        ));
    }
}

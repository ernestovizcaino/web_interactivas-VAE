<?php

namespace App\Http\Requests;

use App\Models\Receta;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RecetaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:150'],
            'categoria' => ['required', Rule::in(Receta::CATEGORIAS)],
            'tiempo_minutos' => ['required', 'integer', 'min:1', 'max:4294967295'],
            'dificultad' => ['required', Rule::in(Receta::DIFICULTADES)],
            'ingredientes' => ['required', 'string', 'max:20000'],
            'pasos' => ['required', 'string', 'max:20000'],
            'nota_personal' => ['nullable', 'string', 'max:5000'],
        ];
    }

    public function attributes(): array
    {
        return [
            'titulo' => 'título',
            'categoria' => 'categoría',
            'tiempo_minutos' => 'tiempo en minutos',
            'dificultad' => 'dificultad',
            'ingredientes' => 'ingredientes',
            'pasos' => 'pasos de preparación',
            'nota_personal' => 'nota personal',
        ];
    }

    public function messages(): array
    {
        return [
            'categoria.in' => 'Selecciona desayuno, almuerzo, cena, postre o bebida.',
            'dificultad.in' => 'Selecciona una dificultad: fácil, media o difícil.',
            'tiempo_minutos.min' => 'El tiempo debe ser mayor a 0 minutos.',
            'tiempo_minutos.integer' => 'Escribe el tiempo en minutos enteros.',
        ];
    }
}

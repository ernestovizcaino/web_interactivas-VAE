<?php

namespace App\Http\Requests\Admin;

use App\Enums\EstadoTorneo;
use App\Models\Torneo;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class TorneoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return (bool) $this->user()?->isAdmin();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $torneo = $this->route('torneo');
        $inscritos = $torneo instanceof Torneo ? $torneo->inscripciones()->count() : 0;

        return [
            'nombre' => ['required', 'string', 'max:120'],
            'juego' => ['required', 'string', 'max:80'],
            'fecha' => ['required', 'date', ...$this->fechaDebeSerFutura($torneo) ? ['after:now'] : []],
            'cupo' => ['required', 'integer', 'min:2', 'max:100', "min:{$inscritos}"],
            'descripcion' => ['nullable', 'string', 'max:2000'],
            'estado' => ['required', Rule::enum(EstadoTorneo::class)],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        $torneo = $this->route('torneo');
        $inscritos = $torneo instanceof Torneo ? $torneo->inscripciones()->count() : 0;

        return [
            'nombre.required' => 'El nombre del torneo es obligatorio.',
            'nombre.max' => 'El nombre no puede tener más de 120 caracteres.',
            'juego.required' => 'Indica el juego o deporte del torneo.',
            'juego.max' => 'El juego o deporte no puede tener más de 80 caracteres.',
            'fecha.required' => 'La fecha del torneo es obligatoria.',
            'fecha.date' => 'La fecha no tiene un formato válido.',
            'fecha.after' => 'La fecha del torneo debe ser futura.',
            'cupo.required' => 'El cupo es obligatorio.',
            'cupo.integer' => 'El cupo debe ser un número entero.',
            'cupo.min' => $inscritos > 2
                ? "El cupo no puede ser menor a {$inscritos}: ya hay {$inscritos} jugadores inscritos."
                : 'El cupo mínimo es de 2 jugadores.',
            'cupo.max' => 'El cupo máximo es de 100 jugadores.',
            'descripcion.max' => 'La descripción no puede tener más de 2000 caracteres.',
            'estado.required' => 'Selecciona el estado del torneo.',
            'estado.enum' => 'El estado debe ser abierto o cerrado.',
        ];
    }

    /**
     * Al editar, un torneo que ya pasó puede conservar su fecha original.
     */
    private function fechaDebeSerFutura(mixed $torneo): bool
    {
        if (! $torneo instanceof Torneo || ! $this->filled('fecha')) {
            return true;
        }

        try {
            return ! Carbon::parse($this->input('fecha'))->equalTo($torneo->fecha);
        } catch (\Throwable) {
            return true;
        }
    }
}

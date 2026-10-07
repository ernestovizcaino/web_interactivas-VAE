<?php

namespace App\Http\Controllers;

use App\Enums\EstadoTorneo;
use App\Models\Inscripcion;
use App\Models\Torneo;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InscripcionController extends Controller
{
    /**
     * Pantalla "Mis torneos" del jugador.
     */
    public function index(Request $request): Response
    {
        $inscripciones = $request->user()
            ->inscripciones()
            ->with(['torneo' => fn ($query) => $query
                ->withCount('inscripciones')
                ->with(['inscripciones' => fn ($query) => $query->with('user:id,name')->oldest()]),
            ])
            ->get()
            ->sortBy(fn (Inscripcion $inscripcion) => $inscripcion->torneo->fecha)
            ->values();

        return Inertia::render('torneos/mis-torneos', [
            'inscripciones' => $inscripciones->map(fn (Inscripcion $inscripcion) => [
                'id' => $inscripcion->id,
                'fecha_inscripcion' => $inscripcion->created_at?->toIso8601String(),
                'puede_cancelar' => ! $inscripcion->torneo->yaPaso(),
                'torneo' => [
                    ...$inscripcion->torneo->resumen($request->user()),
                    'participantes' => $inscripcion->torneo->inscripciones
                        ->map(fn (Inscripcion $otra) => $otra->user->name)
                        ->values(),
                ],
            ]),
        ]);
    }

    /**
     * Inscribe al jugador autenticado en el torneo.
     */
    public function store(Request $request, Torneo $torneo): RedirectResponse
    {
        $user = $request->user();

        $error = DB::transaction(function () use ($torneo, $user) {
            $torneo = Torneo::query()->lockForUpdate()->withCount('inscripciones')->findOrFail($torneo->id);

            $error = match (true) {
                $torneo->tieneInscrito($user) => 'Ya estás inscrito en este torneo.',
                $torneo->yaPaso() => 'Este torneo ya se realizó; las inscripciones están cerradas.',
                $torneo->estado === EstadoTorneo::Cerrado => 'Las inscripciones de este torneo están cerradas.',
                $torneo->estaLleno() => 'El torneo está lleno: no quedan plazas disponibles.',
                default => null,
            };

            if ($error === null) {
                try {
                    $torneo->inscripciones()->create(['user_id' => $user->id]);
                } catch (UniqueConstraintViolationException) {
                    return 'Ya estás inscrito en este torneo.';
                }
            }

            return $error;
        });

        Inertia::flash('toast', $error === null
            ? ['type' => 'success', 'message' => "¡Listo! Te inscribiste en «{$torneo->nombre}»."]
            : ['type' => 'error', 'message' => $error]);

        return back();
    }

    /**
     * Cancela la inscripción del jugador, liberando su plaza, siempre que el torneo no haya pasado.
     */
    public function destroy(Request $request, Torneo $torneo): RedirectResponse
    {
        $inscripcion = $torneo->inscripciones()->where('user_id', $request->user()->id)->first();

        if ($inscripcion === null) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'No estás inscrito en este torneo.']);

            return back();
        }

        if ($torneo->yaPaso()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Ya no puedes cancelar: la fecha del torneo pasó.']);

            return back();
        }

        $inscripcion->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => "Cancelaste tu inscripción en «{$torneo->nombre}». Tu plaza quedó libre."]);

        return back();
    }
}

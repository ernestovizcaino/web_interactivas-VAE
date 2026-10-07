<?php

namespace App\Http\Controllers;

use App\Models\Inscripcion;
use App\Models\Torneo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TorneoController extends Controller
{
    /**
     * Listado público: solo torneos abiertos, con fecha futura y cupo libre.
     */
    public function index(Request $request): Response
    {
        $buscar = $request->string('buscar')->trim()->value();
        $juego = $request->string('juego')->trim()->value();

        $torneos = Torneo::query()
            ->disponibles()
            ->withCount('inscripciones')
            ->with(['inscripciones' => fn ($query) => $query->with('user:id,name')->oldest()])
            ->buscar($buscar)
            ->when($juego, fn ($query) => $query->where('juego', $juego))
            ->orderBy('fecha')
            ->get();

        return Inertia::render('torneos/index', [
            'torneos' => $torneos->map(fn (Torneo $torneo) => [
                ...$torneo->resumen($request->user()),
                'participantes' => $torneo->inscripciones
                    ->map(fn (Inscripcion $inscripcion) => $inscripcion->user->name)
                    ->values(),
            ]),
            'juegos' => Torneo::disponibles()
                ->selectRaw('juego, count(*) as total')
                ->groupBy('juego')
                ->orderBy('juego')
                ->get()
                ->map(fn (Torneo $torneo) => ['nombre' => $torneo->juego, 'total' => (int) $torneo->getAttribute('total')]),
            'filtros' => ['buscar' => $buscar, 'juego' => $juego],
        ]);
    }

    /**
     * Detalle del torneo con su lista de participantes (accesible aunque esté cerrado o lleno).
     */
    public function show(Request $request, Torneo $torneo): Response
    {
        $torneo->loadCount('inscripciones');
        $user = $request->user();

        return Inertia::render('torneos/show', [
            'torneo' => $torneo->resumen($user),
            'participantes' => $torneo->inscripciones()
                ->with('user:id,name')
                ->oldest()
                ->get()
                ->map(fn (Inscripcion $inscripcion) => [
                    'id' => $inscripcion->user->id,
                    'nombre' => $inscripcion->user->name,
                    'fecha' => $inscripcion->created_at?->toIso8601String(),
                ]),
        ]);
    }
}

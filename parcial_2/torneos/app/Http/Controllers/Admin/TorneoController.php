<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TorneoRequest;
use App\Models\Inscripcion;
use App\Models\Torneo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TorneoController extends Controller
{
    /**
     * Panel de administración con todos los torneos.
     */
    public function index(Request $request): Response
    {
        $buscar = $request->string('buscar')->trim()->value();

        $torneos = Torneo::query()
            ->withCount('inscripciones')
            ->buscar($buscar)
            ->orderBy('fecha')
            ->get();

        return Inertia::render('admin/torneos/index', [
            'torneos' => $torneos->map(fn (Torneo $torneo) => $torneo->resumen()),
            'filtros' => ['buscar' => $buscar],
            'estadisticas' => [
                'torneos' => Torneo::count(),
                'disponibles' => Torneo::disponibles()->count(),
                'inscripciones' => Inscripcion::count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/torneos/create');
    }

    public function store(TorneoRequest $request): RedirectResponse
    {
        $torneo = Torneo::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => "Torneo «{$torneo->nombre}» creado correctamente."]);

        return to_route('admin.torneos.index');
    }

    /**
     * Detalle de administración con la lista de inscritos.
     */
    public function show(Torneo $torneo): Response
    {
        $torneo->loadCount('inscripciones');

        return Inertia::render('admin/torneos/show', [
            'torneo' => $torneo->resumen(),
            'inscripciones' => $torneo->inscripciones()
                ->with('user:id,name,email')
                ->oldest()
                ->get()
                ->map(fn (Inscripcion $inscripcion) => [
                    'id' => $inscripcion->id,
                    'nombre' => $inscripcion->user->name,
                    'email' => $inscripcion->user->email,
                    'fecha' => $inscripcion->created_at?->toIso8601String(),
                ]),
        ]);
    }

    public function edit(Torneo $torneo): Response
    {
        $torneo->loadCount('inscripciones');

        return Inertia::render('admin/torneos/edit', [
            'torneo' => $torneo->resumen(),
        ]);
    }

    public function update(TorneoRequest $request, Torneo $torneo): RedirectResponse
    {
        $torneo->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => "Torneo «{$torneo->nombre}» actualizado."]);

        return to_route('admin.torneos.index');
    }

    /**
     * Elimina el torneo; sus inscripciones se borran en cascada.
     */
    public function destroy(Torneo $torneo): RedirectResponse
    {
        $torneo->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => "Torneo «{$torneo->nombre}» eliminado junto con sus inscripciones."]);

        return to_route('admin.torneos.index');
    }
}

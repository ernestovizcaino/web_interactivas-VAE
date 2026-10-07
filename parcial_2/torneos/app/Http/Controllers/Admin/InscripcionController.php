<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inscripcion;
use App\Models\Torneo;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class InscripcionController extends Controller
{
    /**
     * Da de baja cualquier inscripción de un torneo.
     */
    public function destroy(Torneo $torneo, Inscripcion $inscripcion): RedirectResponse
    {
        abort_unless($inscripcion->torneo_id === $torneo->id, 404);

        $nombre = $inscripcion->user->name;
        $inscripcion->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$nombre} fue dado de baja del torneo."]);

        return back();
    }
}

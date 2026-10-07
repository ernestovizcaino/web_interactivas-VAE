<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Permite el paso solo a usuarios con el rol indicado; el resto se redirige con un aviso.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        if ($user === null) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Debes iniciar sesión para acceder a esa sección.']);

            return redirect()->guest(route('login'));
        }

        if ($user->role->value !== $role) {
            $message = $role === 'admin'
                ? 'Solo los administradores pueden acceder a esa sección.'
                : 'Esta acción es exclusiva para jugadores.';

            Inertia::flash('toast', ['type' => 'error', 'message' => $message]);

            return redirect()->route('torneos.index');
        }

        return $next($request);
    }
}

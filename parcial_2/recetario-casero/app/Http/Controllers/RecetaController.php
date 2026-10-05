<?php

namespace App\Http\Controllers;

use App\Http\Requests\RecetaRequest;
use App\Models\Receta;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class RecetaController extends Controller
{
    public function index(Request $request): View
    {
        $filtros = $request->validate([
            'buscar' => ['nullable', 'string', 'max:150'],
            'categoria' => ['nullable', Rule::in(Receta::CATEGORIAS)],
        ], [], ['buscar' => 'búsqueda', 'categoria' => 'categoría']);

        $buscar = $filtros['buscar'] ?? '';
        $categoria = $filtros['categoria'] ?? '';
        $consulta = $request->user()->recetas();

        if ($buscar !== '') {
            $patron = str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $buscar);
            $consulta->whereRaw("titulo LIKE ? ESCAPE '!'", ['%'.$patron.'%']);
        }

        if ($categoria !== '') {
            $consulta->where('categoria', $categoria);
        }

        return view('recetas.index', [
            'recetas' => $consulta->select(['id', 'user_id', 'titulo', 'categoria', 'tiempo_minutos', 'dificultad', 'created_at'])
                ->latest()->orderByDesc('id')->paginate(10)->withQueryString(),
            'totalRecetas' => $request->user()->recetas()->count(),
            'categorias' => Receta::CATEGORIAS,
            'buscar' => $buscar,
            'categoria' => $categoria,
        ]);
    }

    public function create(): View
    {
        return view('recetas.create', $this->datosFormulario(new Receta));
    }

    public function store(RecetaRequest $request): RedirectResponse
    {
        $request->user()->recetas()->create($request->validated());

        return to_route('recetas.index')->with('success', 'Receta creada correctamente.');
    }

    public function show(Request $request, Receta $receta): View
    {
        return view($request->query('confirmar') === 'eliminar' ? 'recetas.confirmar' : 'recetas.show', compact('receta'));
    }

    public function edit(Receta $receta): View
    {
        return view('recetas.edit', $this->datosFormulario($receta));
    }

    public function update(RecetaRequest $request, Receta $receta): RedirectResponse
    {
        $receta->update($request->validated());

        return to_route('recetas.show', $receta)->with('success', 'Receta actualizada correctamente.');
    }

    public function destroy(Receta $receta): RedirectResponse
    {
        $receta->delete();

        return to_route('recetas.index')->with('success', 'Receta eliminada correctamente.');
    }

    private function datosFormulario(Receta $receta): array
    {
        return [
            'receta' => $receta,
            'categorias' => Receta::CATEGORIAS,
            'dificultades' => Receta::DIFICULTADES,
        ];
    }
}

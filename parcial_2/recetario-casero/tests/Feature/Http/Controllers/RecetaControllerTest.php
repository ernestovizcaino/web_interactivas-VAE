<?php

namespace Tests\Feature\Http\Controllers;

use App\Models\Receta;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\TestWith;
use Tests\TestCase;

class RecetaControllerTest extends TestCase
{
    use LazilyRefreshDatabase;

    #[TestWith(['GET', '/recetas'])]
    #[TestWith(['GET', '/recetas/crear'])]
    #[TestWith(['POST', '/recetas'])]
    #[TestWith(['GET', '/recetas/1'])]
    #[TestWith(['GET', '/recetas/1/editar'])]
    #[TestWith(['PUT', '/recetas/1'])]
    #[TestWith(['PATCH', '/recetas/1'])]
    #[TestWith(['DELETE', '/recetas/1'])]
    public function test_visitante_debe_iniciar_sesion_en_todas_las_operaciones(string $metodo, string $ruta): void
    {
        $respuesta = $this->call($metodo, $ruta);

        $respuesta->assertRedirectToRoute('login');
    }

    public function test_muestra_recetario_vacio_de_una_cuenta_nueva(): void
    {
        $respuesta = $this->actingAs(User::factory()->create())->get(route('recetas.index'));

        $respuesta->assertSee('Aún no tienes recetas.')->assertSee('Guardar mi primera receta');
    }

    public function test_crea_receta_y_asigna_el_usuario_autenticado_ignorando_otro_propietario(): void
    {
        $usuario = User::factory()->create();
        $otroUsuario = User::factory()->create();

        $respuesta = $this->actingAs($usuario)->post(route('recetas.store'), [
            ...$this->datosValidos(),
            'user_id' => $otroUsuario->id,
            'campo_inesperado' => 'ignorar',
        ]);

        $respuesta->assertRedirectToRoute('recetas.index')->assertSessionHas('success', 'Receta creada correctamente.');
        $this->assertDatabaseHas('recetas', [...$this->datosValidos(), 'user_id' => $usuario->id]);
        $this->assertSame(0, $otroUsuario->recetas()->count());
    }

    public function test_nota_personal_es_opcional(): void
    {
        $datos = $this->datosValidos();
        unset($datos['nota_personal']);

        $respuesta = $this->actingAs(User::factory()->create())->post(route('recetas.store'), $datos);

        $respuesta->assertRedirectToRoute('recetas.index');
        $this->assertDatabaseHas('recetas', ['titulo' => 'Pan casero', 'nota_personal' => null]);
    }

    public function test_rechaza_campos_obligatorios_vacios_sin_guardar(): void
    {
        $respuesta = $this->actingAs(User::factory()->create())->from(route('recetas.create'))->post(route('recetas.store'), []);

        $respuesta->assertRedirectToRoute('recetas.create')->assertSessionHasErrors([
            'titulo' => 'El campo título es obligatorio.',
            'categoria' => 'El campo categoría es obligatorio.',
            'tiempo_minutos' => 'El campo tiempo en minutos es obligatorio.',
            'dificultad' => 'El campo dificultad es obligatorio.',
            'ingredientes' => 'El campo ingredientes es obligatorio.',
            'pasos' => 'El campo pasos de preparación es obligatorio.',
        ]);
        $this->assertDatabaseCount('recetas', 0);
    }

    #[DataProvider('datosInvalidos')]
    public function test_rechaza_datos_invalidos_con_error_del_campo(string $campo, mixed $valor, string $mensaje): void
    {
        $datos = [...$this->datosValidos(), $campo => $valor];

        $respuesta = $this->actingAs(User::factory()->create())->post(route('recetas.store'), $datos);

        $respuesta->assertSessionHasErrors([$campo => $mensaje])->assertSessionHasInput('titulo', $datos['titulo']);
        $this->assertDatabaseCount('recetas', 0);
    }

    public static function datosInvalidos(): array
    {
        return [
            'categoria desconocida' => ['categoria', 'merienda', 'Selecciona desayuno, almuerzo, cena, postre o bebida.'],
            'dificultad desconocida' => ['dificultad', 'experto', 'Selecciona una dificultad: fácil, media o difícil.'],
            'tiempo cero' => ['tiempo_minutos', 0, 'El tiempo debe ser mayor a 0 minutos.'],
            'tiempo negativo' => ['tiempo_minutos', -5, 'El tiempo debe ser mayor a 0 minutos.'],
            'tiempo decimal' => ['tiempo_minutos', 2.5, 'Escribe el tiempo en minutos enteros.'],
            'tiempo como texto' => ['tiempo_minutos', 'veinte', 'Escribe el tiempo en minutos enteros.'],
            'tiempo fuera del almacenamiento' => ['tiempo_minutos', 4294967296, 'El campo tiempo en minutos no debe ser mayor que 4294967295.'],
            'titulo demasiado largo' => ['titulo', str_repeat('a', 151), 'El campo título no debe superar 150 caracteres.'],
            'ingredientes como arreglo' => ['ingredientes', ['harina'], 'El campo ingredientes debe ser texto.'],
            'ingredientes demasiado largos' => ['ingredientes', str_repeat('a', 20001), 'El campo ingredientes no debe superar 20000 caracteres.'],
            'pasos como arreglo' => ['pasos', ['mezclar'], 'El campo pasos de preparación debe ser texto.'],
            'pasos demasiado largos' => ['pasos', str_repeat('a', 20001), 'El campo pasos de preparación no debe superar 20000 caracteres.'],
            'nota como arreglo' => ['nota_personal', ['nota'], 'El campo nota personal debe ser texto.'],
            'nota demasiado larga' => ['nota_personal', str_repeat('a', 5001), 'El campo nota personal no debe superar 5000 caracteres.'],
        ];
    }

    public function test_detalle_muestra_ingredientes_y_pasos_como_listas_sin_lineas_vacias(): void
    {
        $usuario = User::factory()->create();
        $receta = Receta::factory()->for($usuario)->create([
            'ingredientes' => " Harina \r\n\r\n Huevo \r\n0",
            'pasos' => " Mezclar. \n\n Hornear. ",
            'nota_personal' => '0',
        ]);

        $respuesta = $this->actingAs($usuario)->get(route('recetas.show', $receta));

        $respuesta->assertSee('<ul', false)->assertSee('<ol', false)->assertSeeInOrder(['Harina', 'Huevo', 'Mezclar.', 'Hornear.'])->assertSee('Mi nota personal');
        $this->assertSame(['Harina', 'Huevo', '0'], $receta->listaIngredientes());
        $this->assertSame(['Mezclar.', 'Hornear.'], $receta->listaPasos());
    }

    public function test_edicion_precarga_los_datos_existentes(): void
    {
        $usuario = User::factory()->create();
        $receta = Receta::factory()->for($usuario)->create($this->datosValidos());

        $respuesta = $this->actingAs($usuario)->get(route('recetas.edit', $receta));

        $respuesta->assertSee('Pan casero')->assertSee('2 tazas de harina')->assertSee('Mezclar.')->assertSee('Mi receta favorita.');
        $respuesta->assertViewHas('receta', fn (Receta $vista): bool => $vista->id === $receta->id);
    }

    public function test_actualiza_receta_y_conserva_su_propietario(): void
    {
        $usuario = User::factory()->create();
        $receta = Receta::factory()->for($usuario)->create();
        $otroUsuario = User::factory()->create();
        $datos = [...$this->datosValidos(), 'titulo' => 'Pan integral', 'nota_personal' => null];

        $respuesta = $this->actingAs($usuario)->put(route('recetas.update', $receta), [...$datos, 'user_id' => $otroUsuario->id]);

        $respuesta->assertRedirectToRoute('recetas.show', $receta)->assertSessionHas('success', 'Receta actualizada correctamente.');
        $this->assertDatabaseHas('recetas', [...$datos, 'id' => $receta->id, 'user_id' => $usuario->id]);
    }

    public function test_edicion_invalida_no_modifica_receta_y_conserva_entrada(): void
    {
        $usuario = User::factory()->create();
        $receta = Receta::factory()->for($usuario)->create(['titulo' => 'Pan original']);

        $respuesta = $this->actingAs($usuario)->put(route('recetas.update', $receta), [...$this->datosValidos(), 'tiempo_minutos' => 0]);

        $respuesta->assertSessionHasErrors(['tiempo_minutos' => 'El tiempo debe ser mayor a 0 minutos.'])->assertSessionHasInput('titulo', 'Pan casero');
        $this->assertDatabaseHas('recetas', ['id' => $receta->id, 'titulo' => 'Pan original']);
    }

    public function test_confirmacion_muestra_la_receta_sin_eliminarla(): void
    {
        $usuario = User::factory()->create();
        $receta = Receta::factory()->for($usuario)->create(['titulo' => 'Pan casero']);

        $respuesta = $this->actingAs($usuario)->get(route('recetas.show', ['receta' => $receta, 'confirmar' => 'eliminar']));

        $respuesta->assertSee('¿Eliminar esta receta?')->assertSee('Pan casero')->assertSee('Conservar receta')->assertSee('Sí, eliminar receta');
        $this->assertModelExists($receta);
    }

    public function test_elimina_receta_y_muestra_mensaje_de_exito(): void
    {
        $usuario = User::factory()->create();
        $receta = Receta::factory()->for($usuario)->create();

        $respuesta = $this->actingAs($usuario)->delete(route('recetas.destroy', $receta));

        $respuesta->assertRedirectToRoute('recetas.index')->assertSessionHas('success', 'Receta eliminada correctamente.');
        $this->assertModelMissing($receta);
    }

    #[TestWith(['GET', 'show'])]
    #[TestWith(['GET', 'edit'])]
    #[TestWith(['PUT', 'update'])]
    #[TestWith(['PATCH', 'update'])]
    #[TestWith(['DELETE', 'destroy'])]
    public function test_receta_de_otra_cuenta_devuelve_404_y_permanece_intacta(string $metodo, string $accion): void
    {
        $receta = Receta::factory()->create(['titulo' => 'Receta privada']);
        $usuario = User::factory()->create();

        $respuesta = $this->actingAs($usuario)->call($metodo, route('recetas.'.$accion, $receta), $this->datosValidos());

        $respuesta->assertNotFound()->assertDontSee('Receta privada');
        $this->assertDatabaseHas('recetas', ['id' => $receta->id, 'titulo' => 'Receta privada']);
    }

    public function test_listado_busca_y_filtra_juntos_sin_mostrar_recetas_ajenas(): void
    {
        $usuario = User::factory()->create();
        $coincide = Receta::factory()->for($usuario)->create(['titulo' => 'Pan de plátano', 'categoria' => 'postre']);
        Receta::factory()->for($usuario)->create(['titulo' => 'Pan de ajo', 'categoria' => 'cena']);
        Receta::factory()->for($usuario)->create(['titulo' => 'Flan casero', 'categoria' => 'postre']);
        Receta::factory()->create(['titulo' => 'Pan secreto', 'categoria' => 'postre']);

        $respuesta = $this->actingAs($usuario)->get(route('recetas.index', ['buscar' => 'PAN', 'categoria' => 'postre']));

        $respuesta->assertSee('Pan de plátano')->assertDontSee('Pan de ajo')->assertDontSee('Flan casero')->assertDontSee('Pan secreto');
        $respuesta->assertViewHas('recetas', fn ($recetas): bool => $recetas->pluck('id')->all() === [$coincide->id]);
        $respuesta->assertViewHas('totalRecetas', 3);
    }

    public function test_busca_por_titulo_sin_exigir_categoria(): void
    {
        $usuario = User::factory()->create();
        Receta::factory()->for($usuario)->create(['titulo' => 'Pan de ajo', 'categoria' => 'cena']);
        Receta::factory()->for($usuario)->create(['titulo' => 'Pan dulce', 'categoria' => 'postre']);
        Receta::factory()->for($usuario)->create(['titulo' => 'Sopa', 'categoria' => 'cena']);

        $respuesta = $this->actingAs($usuario)->get(route('recetas.index', ['buscar' => 'Pan']));

        $respuesta->assertSee('Pan de ajo')->assertSee('Pan dulce')->assertDontSee('Sopa');
    }

    public function test_filtra_categoria_sin_exigir_busqueda(): void
    {
        $usuario = User::factory()->create();
        Receta::factory()->for($usuario)->create(['titulo' => 'Flan casero', 'categoria' => 'postre']);
        Receta::factory()->for($usuario)->create(['titulo' => 'Sopa', 'categoria' => 'cena']);

        $respuesta = $this->actingAs($usuario)->get(route('recetas.index', ['categoria' => 'postre']));

        $respuesta->assertSee('Flan casero')->assertDontSee('Sopa');
    }

    public function test_informa_cuando_no_hay_resultados_y_permite_limpiar(): void
    {
        $usuario = User::factory()->create();
        Receta::factory()->for($usuario)->create(['titulo' => 'Pan casero']);

        $respuesta = $this->actingAs($usuario)->get(route('recetas.index', ['buscar' => 'inexistente', 'categoria' => 'bebida']));

        $respuesta->assertSee('No encontramos recetas.')->assertSee('Limpiar')->assertDontSee('Pan casero');
    }

    public function test_busqueda_trata_porcentaje_y_guion_bajo_como_texto_literal(): void
    {
        $usuario = User::factory()->create();
        Receta::factory()->for($usuario)->create(['titulo' => 'Bebida 100%_natural']);
        Receta::factory()->for($usuario)->create(['titulo' => 'Bebida 100 casera']);

        $respuesta = $this->actingAs($usuario)->get(route('recetas.index', ['buscar' => '100%_']));

        $respuesta->assertSee('Bebida 100%_natural')->assertDontSee('Bebida 100 casera');
    }

    public function test_busqueda_no_ejecuta_sql_introducido_por_el_usuario(): void
    {
        $usuario = User::factory()->create();
        Receta::factory()->for($usuario)->create(['titulo' => 'Pan casero']);

        $respuesta = $this->actingAs($usuario)->get(route('recetas.index', ['buscar' => "' OR 1=1 --"]));

        $respuesta->assertSee('No encontramos recetas.')->assertViewHas('recetas', fn ($recetas): bool => $recetas->isEmpty());
    }

    public function test_paginacion_conserva_filtros_y_solo_contiene_recetas_propias(): void
    {
        $usuario = User::factory()->create();
        Receta::factory()->count(12)->for($usuario)->create(['titulo' => 'Pan casero', 'categoria' => 'postre']);
        Receta::factory()->create(['titulo' => 'Pan privado', 'categoria' => 'postre']);

        $respuesta = $this->actingAs($usuario)->get(route('recetas.index', ['buscar' => 'Pan', 'categoria' => 'postre', 'page' => 2]));

        $respuesta->assertViewHas('recetas', fn ($recetas): bool => $recetas->total() === 12 && $recetas->count() === 2 && str_contains($recetas->previousPageUrl(), 'categoria=postre') && str_contains($recetas->previousPageUrl(), 'buscar=Pan'));
        $respuesta->assertSee('Página 2 de 2')->assertDontSee('Pan privado');
    }

    public function test_muestra_errores_junto_al_campo_y_recupera_datos_previos(): void
    {
        $respuesta = $this->actingAs(User::factory()->create())->withSession([
            '_old_input' => ['titulo' => 'Mi pan'],
            'errors' => ['default' => ['format' => ':message', 'messages' => ['tiempo_minutos' => ['El tiempo debe ser mayor a 0 minutos.']]]],
        ])->get(route('recetas.create'));

        $respuesta->assertSee('value="Mi pan"', false)->assertSee('id="tiempo_minutos-error"', false)->assertSee('El tiempo debe ser mayor a 0 minutos.');
    }

    public function test_escapa_textos_del_usuario_en_detalle_y_encabezado(): void
    {
        $peligroso = '<script>alert("xss")</script>';
        $usuario = User::factory()->create(['name' => $peligroso]);
        $receta = Receta::factory()->for($usuario)->create(['titulo' => $peligroso, 'ingredientes' => $peligroso, 'pasos' => $peligroso, 'nota_personal' => $peligroso]);

        $respuesta = $this->actingAs($usuario)->get(route('recetas.show', $receta));

        $respuesta->assertSee($peligroso)->assertDontSee($peligroso, false);
    }

    private function datosValidos(): array
    {
        return [
            'titulo' => 'Pan casero',
            'categoria' => 'desayuno',
            'tiempo_minutos' => 30,
            'dificultad' => 'fácil',
            'ingredientes' => "2 tazas de harina\n1 huevo",
            'pasos' => "Mezclar.\nHornear.",
            'nota_personal' => 'Mi receta favorita.',
        ];
    }
}

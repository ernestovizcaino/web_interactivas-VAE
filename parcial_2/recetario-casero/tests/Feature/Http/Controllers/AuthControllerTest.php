<?php

namespace Tests\Feature\Http\Controllers;

use App\Models\Receta;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use PHPUnit\Framework\Attributes\TestWith;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_registra_una_cuenta_con_recetario_vacio_y_contrasena_protegida(): void
    {
        $respuesta = $this->post(route('register.store'), [
            'name' => 'Ana',
            'email' => ' ANA@EJEMPLO.COM ',
            'password' => 'Cocina123!',
            'password_confirmation' => 'Cocina123!',
        ]);

        $respuesta->assertRedirectToRoute('recetas.index')->assertSessionHas('success', '¡Bienvenido! Tu recetario está listo.');
        $usuario = User::where('email', 'ana@ejemplo.com')->firstOrFail();
        $this->assertAuthenticatedAs($usuario);
        $this->assertTrue(Hash::check('Cocina123!', $usuario->password));
        $this->assertDatabaseCount('recetas', 0);
    }

    public function test_rechaza_registro_vacio_con_mensajes_en_espanol(): void
    {
        $respuesta = $this->from(route('register'))->post(route('register.store'), []);

        $respuesta->assertRedirectToRoute('register')->assertSessionHasErrors([
            'name' => 'El campo nombre es obligatorio.',
            'email' => 'El campo correo electrónico es obligatorio.',
            'password' => 'El campo contraseña es obligatorio.',
            'password_confirmation' => 'El campo confirmación de contraseña es obligatorio.',
        ]);
        $this->assertGuest();
        $this->assertDatabaseCount('users', 0);
    }

    #[TestWith(['email', 'correo-invalido', 'Escribe un correo electrónico válido.'])]
    #[TestWith(['password', 'corta', 'El campo contraseña debe tener al menos 8 caracteres.'])]
    #[TestWith(['password_confirmation', 'distinta', 'Las contraseñas no coinciden.'])]
    public function test_rechaza_datos_invalidos_del_registro(string $campo, string $valor, string $mensaje): void
    {
        $datos = ['name' => 'Ana', 'email' => 'ana@ejemplo.com', 'password' => 'Cocina123!', 'password_confirmation' => 'Cocina123!'];
        $datos[$campo] = $valor;
        if ($campo === 'password') {
            $datos['password_confirmation'] = $valor;
        }

        $respuesta = $this->post(route('register.store'), $datos);

        $respuesta->assertSessionHasErrors([$campo === 'password_confirmation' ? 'password' : $campo => $mensaje]);
        $this->assertGuest();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_rechaza_correo_duplicado_sin_importar_mayusculas(): void
    {
        User::factory()->create(['email' => 'ana@ejemplo.com']);

        $respuesta = $this->post(route('register.store'), ['name' => 'Ana', 'email' => 'ANA@EJEMPLO.COM', 'password' => 'Cocina123!', 'password_confirmation' => 'Cocina123!']);

        $respuesta->assertSessionHasErrors(['email' => 'Este correo electrónico ya está registrado.']);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_rechaza_contrasena_multibyte_demasiado_larga_sin_error_del_servidor(): void
    {
        $contrasena = str_repeat('á', 40);

        $respuesta = $this->post(route('register.store'), ['name' => 'Ana', 'email' => 'ana@ejemplo.com', 'password' => $contrasena, 'password_confirmation' => $contrasena]);

        $respuesta->assertSessionHasErrors(['password' => 'La contraseña es demasiado larga. Usa menos caracteres.']);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_inicia_sesion_y_recordar_emite_cookie(): void
    {
        $usuario = User::factory()->create(['email' => 'ana@ejemplo.com', 'password' => 'Cocina123!']);

        $respuesta = $this->post(route('login.store'), ['email' => 'ANA@EJEMPLO.COM', 'password' => 'Cocina123!', 'remember' => '1']);

        $respuesta->assertRedirectToRoute('recetas.index');
        $respuesta->assertCookie(auth()->guard()->getRecallerName());
        $this->assertAuthenticatedAs($usuario);
    }

    public function test_rechaza_credenciales_incorrectas(): void
    {
        User::factory()->create(['email' => 'ana@ejemplo.com']);

        $respuesta = $this->post(route('login.store'), ['email' => 'ana@ejemplo.com', 'password' => 'incorrecta']);

        $respuesta->assertSessionHasErrors(['email' => 'El correo o la contraseña no son correctos.']);
        $this->assertGuest();
    }

    public function test_limita_los_intentos_de_inicio_de_sesion(): void
    {
        $usuario = User::factory()->create(['email' => 'ana@ejemplo.com', 'password' => 'Cocina123!']);
        $this->freezeTime();
        RateLimiter::increment('login:ana@ejemplo.com|127.0.0.1', 60, 5);

        $respuesta = $this->post(route('login.store'), ['email' => $usuario->email, 'password' => 'Cocina123!']);

        $respuesta->assertSessionHasErrors(['email' => 'Demasiados intentos. Intenta de nuevo en 60 segundos.']);
        $this->assertGuest();
    }

    public function test_cierra_sesion_y_elimina_datos_de_sesion(): void
    {
        $usuario = User::factory()->create();

        $respuesta = $this->actingAs($usuario)->withSession(['dato_privado' => 'secreto'])->post(route('logout'));

        $respuesta->assertRedirectToRoute('login')->assertSessionMissing('dato_privado');
        $this->assertGuest();
    }

    #[TestWith(['login'])]
    #[TestWith(['register'])]
    public function test_cuenta_autenticada_vuelve_al_recetario_desde_acceso(string $ruta): void
    {
        $respuesta = $this->actingAs(User::factory()->create())->get(route($ruta));

        $respuesta->assertRedirectToRoute('recetas.index');
    }

    public function test_una_segunda_cuenta_empieza_sin_recetas_del_primer_usuario(): void
    {
        Receta::factory()->create(['titulo' => 'Receta privada de otra cuenta']);

        $respuesta = $this->post(route('register.store'), ['name' => 'Luis', 'email' => 'luis@ejemplo.com', 'password' => 'Cocina123!', 'password_confirmation' => 'Cocina123!']);

        $respuesta->assertRedirectToRoute('recetas.index');
        $this->assertSame(0, auth()->user()->recetas()->count());
        $this->assertDatabaseCount('recetas', 1);
    }
}

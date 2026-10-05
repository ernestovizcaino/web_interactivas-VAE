<?php

namespace App\Http\Controllers;

use App\Models\User;
use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

class AuthController extends Controller
{
    public function loginForm(): View
    {
        return view('auth.login');
    }

    public function registerForm(): View
    {
        return view('auth.register');
    }

    public function register(Request $request): RedirectResponse
    {
        $this->normalizarCorreo($request);
        $datos = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:254', 'unique:users,email'],
            'password_confirmation' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'max:72', 'confirmed',
                function (string $attribute, mixed $value, Closure $fail): void {
                    if (is_string($value) && strlen($value) > 72) {
                        $fail('La contraseña es demasiado larga. Usa menos caracteres.');
                    }
                },
            ],
        ]);

        Auth::login(User::create(['name' => $datos['name'], 'email' => $datos['email'], 'password' => $datos['password']]));
        $request->session()->regenerate();

        return to_route('recetas.index')->with('success', '¡Bienvenido! Tu recetario está listo.');
    }

    public function login(Request $request): RedirectResponse
    {
        $this->normalizarCorreo($request);
        $credenciales = $request->validate([
            'email' => ['required', 'email', 'max:254'],
            'password' => ['required', 'string'],
        ]);
        $clave = 'login:'.$credenciales['email'].'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($clave, 5)) {
            $segundos = RateLimiter::availableIn($clave);
            throw ValidationException::withMessages(['email' => "Demasiados intentos. Intenta de nuevo en {$segundos} segundos."]);
        }

        if (! Auth::attempt($credenciales, $request->boolean('remember'))) {
            RateLimiter::hit($clave, 60);
            throw ValidationException::withMessages(['email' => 'El correo o la contraseña no son correctos.']);
        }

        RateLimiter::clear($clave);
        $request->session()->regenerate();

        return redirect()->intended(route('recetas.index'));
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return to_route('login')->with('success', 'Cerraste sesión correctamente.');
    }

    private function normalizarCorreo(Request $request): void
    {
        if (is_string($request->input('email'))) {
            $request->merge(['email' => mb_strtolower(trim($request->input('email')))]);
        }
    }
}

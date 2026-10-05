<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Model::preventLazyLoading(! $this->app->isProduction());
        Route::resourceVerbs(['create' => 'crear', 'edit' => 'editar']);
        RateLimiter::for('registro', fn (Request $request) => Limit::perMinute(5)->by($request->ip())
            ->response(fn () => back()->withErrors(['email' => 'Demasiados registros. Espera un minuto.'])
                ->withInput($request->only('name', 'email'))));
    }
}

<?php

namespace App\Models;

use App\Enums\EstadoTorneo;
use Database\Factories\TorneoFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $nombre
 * @property string $juego
 * @property Carbon $fecha
 * @property int $cupo
 * @property string|null $descripcion
 * @property EstadoTorneo $estado
 * @property int|null $inscripciones_count
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['nombre', 'juego', 'fecha', 'cupo', 'descripcion', 'estado'])]
class Torneo extends Model
{
    /** @use HasFactory<TorneoFactory> */
    use HasFactory;

    protected $table = 'torneos';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fecha' => 'datetime',
            'cupo' => 'integer',
            'estado' => EstadoTorneo::class,
        ];
    }

    /**
     * @return HasMany<Inscripcion, $this>
     */
    public function inscripciones(): HasMany
    {
        return $this->hasMany(Inscripcion::class);
    }

    /**
     * @return BelongsToMany<User, $this>
     */
    public function jugadores(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'inscripciones')->withTimestamps();
    }

    /**
     * Torneos abiertos, con fecha futura y con cupo libre.
     *
     * @param  Builder<Torneo>  $query
     */
    public function scopeDisponibles(Builder $query): void
    {
        $query->where('estado', EstadoTorneo::Abierto)
            ->where('fecha', '>', now())
            ->whereRaw('(select count(*) from inscripciones where inscripciones.torneo_id = torneos.id) < torneos.cupo');
    }

    /**
     * @param  Builder<Torneo>  $query
     */
    public function scopeBuscar(Builder $query, ?string $termino): void
    {
        $query->when($termino, fn (Builder $query) => $query->where(function (Builder $query) use ($termino) {
            $query->where('nombre', 'like', "%{$termino}%")
                ->orWhere('juego', 'like', "%{$termino}%");
        }));
    }

    public function totalInscritos(): int
    {
        return $this->inscripciones_count ?? $this->inscripciones()->count();
    }

    public function plazasLibres(): int
    {
        return max(0, $this->cupo - $this->totalInscritos());
    }

    public function estaLleno(): bool
    {
        return $this->plazasLibres() === 0;
    }

    public function yaPaso(): bool
    {
        return $this->fecha->isPast();
    }

    /**
     * Un torneo está cerrado si el admin lo marca así, si su fecha ya pasó o si se llenó el cupo.
     */
    public function estaCerrado(): bool
    {
        return $this->estado === EstadoTorneo::Cerrado || $this->yaPaso() || $this->estaLleno();
    }

    /**
     * Estado visible para la interfaz: abierto, lleno, cerrado o finalizado.
     */
    public function estadoVisible(): string
    {
        return match (true) {
            $this->yaPaso() => 'finalizado',
            $this->estado === EstadoTorneo::Cerrado => 'cerrado',
            $this->estaLleno() => 'lleno',
            default => 'abierto',
        };
    }

    public function tieneInscrito(?User $user): bool
    {
        if ($user === null) {
            return false;
        }

        return $this->relationLoaded('inscripciones')
            ? $this->inscripciones->contains('user_id', $user->id)
            : $this->inscripciones()->where('user_id', $user->id)->exists();
    }

    /**
     * @return array<string, mixed>
     */
    public function resumen(?User $user = null): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'juego' => $this->juego,
            'fecha' => $this->fecha->toIso8601String(),
            'fecha_local' => $this->fecha->format('Y-m-d\TH:i'),
            'cupo' => $this->cupo,
            'descripcion' => $this->descripcion,
            'estado' => $this->estado->value,
            'estado_visible' => $this->estadoVisible(),
            'inscritos' => $this->totalInscritos(),
            'plazas_libres' => $this->plazasLibres(),
            'inscrito' => $this->tieneInscrito($user),
        ];
    }
}

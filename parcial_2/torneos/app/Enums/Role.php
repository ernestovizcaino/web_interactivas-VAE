<?php

namespace App\Enums;

enum Role: string
{
    case Admin = 'admin';
    case Jugador = 'jugador';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrador',
            self::Jugador => 'Jugador',
        };
    }
}

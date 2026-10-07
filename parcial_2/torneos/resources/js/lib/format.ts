const fechaLarga = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

const fechaCorta = new Intl.DateTimeFormat('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
});

const hora = new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
});

function capitalizar(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const relativa = new Intl.RelativeTimeFormat('es-MX', { numeric: 'auto' });

export function formatFechaLarga(iso: string): string {
    return capitalizar(fechaLarga.format(new Date(iso)));
}

export function formatFechaCorta(iso: string): string {
    return capitalizar(fechaCorta.format(new Date(iso)));
}

export function formatHora(iso: string): string {
    return hora.format(new Date(iso));
}

export function formatRelativa(iso: string): string {
    const dias = Math.round(
        (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );

    if (Math.abs(dias) < 1) {
        return 'hoy';
    }

    return relativa.format(dias, 'day');
}

const diaMes = new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
});

const diaSemana = new Intl.DateTimeFormat('es-MX', { weekday: 'long' });

export function formatDiaMes(fecha: Date): string {
    return diaMes.format(fecha).replace('.', '');
}

export function formatDiaSemana(fecha: Date): string {
    return diaSemana.format(fecha);
}

/**
 * Clave YYYY-MM-DD en la zona horaria del navegador.
 */
export function claveDia(fecha: Date): string {
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${fecha.getFullYear()}-${mes}-${dia}`;
}

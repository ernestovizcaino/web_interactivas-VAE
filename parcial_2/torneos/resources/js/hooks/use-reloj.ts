import { useEffect, useState } from 'react';

function zonaHoraria(fecha: Date): string {
    const offset = -fecha.getTimezoneOffset() / 60;

    return `GMT${offset >= 0 ? '+' : ''}${offset}`;
}

function horaActual(fecha: Date): string {
    return fecha.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    });
}

/**
 * Hora local del navegador que se actualiza cada minuto.
 */
export function useReloj(): { hora: string; zona: string } {
    const [ahora, setAhora] = useState(() => new Date());

    useEffect(() => {
        const intervalo = window.setInterval(
            () => setAhora(new Date()),
            15_000,
        );

        return () => window.clearInterval(intervalo);
    }, []);

    return { hora: horaActual(ahora), zona: zonaHoraria(ahora) };
}

import { cn } from '@/lib/utils';

const emojis: [RegExp, string][] = [
    [/f[uú]tbol|soccer/i, '⚽'],
    [/b[aá]squet|basket/i, '🏀'],
    [/voley|v[oó]lei/i, '🏐'],
    [/ajedrez|chess/i, '♟️'],
    [/ping|tenis de mesa/i, '🏓'],
    [/tenis/i, '🎾'],
    [/rocket/i, '🚀'],
    [/fifa|ea fc/i, '🎮'],
    [/valorant|counter|cs/i, '🎯'],
    [/league|lol/i, '⚔️'],
];

const paletas = [
    'from-lime-300 via-emerald-200 to-sky-200 text-emerald-950',
    'from-violet-500 via-fuchsia-500 to-orange-300 text-white',
    'from-sky-400 via-blue-500 to-indigo-700 text-white',
    'from-amber-200 via-orange-300 to-rose-400 text-orange-950',
    'from-zinc-900 via-zinc-800 to-lime-700 text-lime-100',
    'from-rose-500 via-red-500 to-amber-400 text-white',
    'from-teal-300 via-cyan-300 to-blue-400 text-cyan-950',
];

function hash(texto: string): number {
    return Array.from(texto).reduce(
        (total, letra) => (total * 31 + letra.charCodeAt(0)) >>> 0,
        7,
    );
}

export function emojiDeJuego(juego: string): string {
    return emojis.find(([patron]) => patron.test(juego))?.[1] ?? '🏆';
}

/**
 * Portada generada para cada torneo, al estilo de los pósters de eventos.
 */
export function Portada({
    torneo,
    className,
    grande = false,
}: {
    torneo: { nombre: string; juego: string };
    className?: string;
    grande?: boolean;
}) {
    const paleta = paletas[hash(torneo.juego) % paletas.length];

    return (
        <div
            aria-hidden
            className={cn(
                'relative flex aspect-square shrink-0 flex-col justify-between overflow-hidden rounded-xl bg-linear-to-br p-3 shadow-sm ring-1 ring-black/5',
                paleta,
                className,
            )}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.45),transparent_45%)]" />
            <span
                className={cn(
                    'relative font-semibold tracking-[0.18em] uppercase opacity-80',
                    grande ? 'text-xs' : 'text-[10px]',
                )}
            >
                {torneo.juego}
            </span>
            <span
                className={cn(
                    'relative self-end drop-shadow-sm',
                    grande ? 'text-8xl' : 'text-5xl',
                )}
            >
                {emojiDeJuego(torneo.juego)}
            </span>
            <span
                className={cn(
                    'relative line-clamp-2 leading-tight font-bold',
                    grande ? 'text-2xl' : 'text-sm',
                )}
            >
                {torneo.nombre}
            </span>
        </div>
    );
}

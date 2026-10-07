import { Gamepad2, Users } from 'lucide-react';
import { emojiDeJuego, Portada } from '@/components/torneos/portada';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import {
    claveDia,
    formatDiaMes,
    formatDiaSemana,
    formatHora,
    formatRelativa,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Torneo } from '@/types';

export type Vista = 'tarjetas' | 'lista';

type Grupo = { clave: string; fecha: Date; torneos: Torneo[] };

export function agruparPorDia(torneos: Torneo[]): Grupo[] {
    const grupos = new Map<string, Grupo>();

    for (const torneo of torneos) {
        const fecha = new Date(torneo.fecha);
        const clave = claveDia(fecha);
        const grupo = grupos.get(clave) ?? { clave, fecha, torneos: [] };
        grupo.torneos.push(torneo);
        grupos.set(clave, grupo);
    }

    return [...grupos.values()];
}

type AbrirTorneo = (torneo: Torneo) => void;

export function Timeline({
    torneos,
    vista,
    onAbrir,
    activo,
}: {
    torneos: Torneo[];
    vista: Vista;
    onAbrir: AbrirTorneo;
    activo?: number | null;
}) {
    const grupos = agruparPorDia(torneos);

    if (vista === 'lista') {
        return (
            <div className="grid gap-10">
                {grupos.map((grupo) => (
                    <section key={grupo.clave}>
                        <EncabezadoDia fecha={grupo.fecha} className="pb-3" />
                        <div className="divide-y border-t">
                            {grupo.torneos.map((torneo) => (
                                <FilaTorneo
                                    key={torneo.id}
                                    torneo={torneo}
                                    onAbrir={onAbrir}
                                    activo={activo === torneo.id}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        );
    }

    return (
        <div className="relative grid gap-8 before:absolute before:top-3 before:bottom-4 before:left-[3px] before:border-l before:border-dashed before:border-muted-foreground/30">
            {grupos.map((grupo) => (
                <section key={grupo.clave} className="relative pl-8">
                    <span className="absolute top-[0.45rem] left-0 size-2 rounded-full bg-muted-foreground/30 ring-4 ring-background dark:ring-0" />
                    <EncabezadoDia fecha={grupo.fecha} className="mb-4" />
                    <div className="grid gap-4">
                        {grupo.torneos.map((torneo) => (
                            <TarjetaTorneo
                                key={torneo.id}
                                torneo={torneo}
                                onAbrir={onAbrir}
                                activo={activo === torneo.id}
                            />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}

function EncabezadoDia({
    fecha,
    className,
}: {
    fecha: Date;
    className?: string;
}) {
    return (
        <h3 className={cn('text-base', className)}>
            <span className="font-semibold">{formatDiaMes(fecha)}</span>{' '}
            <span className="text-muted-foreground">
                {formatDiaSemana(fecha)}
            </span>
        </h3>
    );
}

type PropsItem = { torneo: Torneo; onAbrir: AbrirTorneo; activo: boolean };

function TarjetaTorneo({ torneo, onAbrir, activo }: PropsItem) {
    return (
        <article
            className={cn(
                'group/torneo relative flex gap-4 rounded-2xl border border-transparent bg-background p-4 shadow-xs ring-1 ring-black/[0.04] transition-all hover:border-border hover:shadow-md sm:p-5 dark:ring-white/5',
                activo && 'border-primary ring-primary/30',
            )}
        >
            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="text-sm text-muted-foreground tabular-nums">
                    {formatHora(torneo.fecha)}
                    <span className="mx-1.5">·</span>
                    <span className="text-amber-600 dark:text-amber-400">
                        {formatRelativa(torneo.fecha)}
                    </span>
                </p>
                <h4 className="text-lg leading-snug font-semibold text-balance sm:text-xl">
                    <button
                        type="button"
                        onClick={() => onAbrir(torneo)}
                        className="text-left after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none"
                    >
                        {torneo.nombre}
                    </button>
                </h4>
                <Meta icon={Gamepad2}>{torneo.juego}</Meta>
                <Meta icon={Users}>
                    <span className="tabular-nums">
                        {torneo.inscritos}/{torneo.cupo} inscritos
                    </span>
                    <span className="mx-1.5">·</span>
                    <PlazasTexto libres={torneo.plazas_libres} />
                </Meta>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                    <PilaAvatares
                        nombres={torneo.participantes?.slice(0, 4)}
                        extra={torneo.inscritos - Math.min(4, torneo.inscritos)}
                    />
                    <Insignias torneo={torneo} />
                </div>
            </div>
            <Portada torneo={torneo} className="size-24 sm:size-36" />
        </article>
    );
}

function FilaTorneo({ torneo, onAbrir, activo }: PropsItem) {
    return (
        <article
            className={cn(
                'group/torneo relative -mx-3 flex gap-4 rounded-xl px-3 py-5 transition-colors hover:bg-foreground/[0.03] sm:gap-8',
                activo && 'bg-foreground/[0.04]',
            )}
        >
            <p className="w-14 shrink-0 text-sm text-muted-foreground tabular-nums sm:w-20 sm:text-base">
                {formatHora(torneo.fecha)}
            </p>
            <div className="grid min-w-0 flex-1 gap-1.5">
                <div className="flex items-start justify-between gap-3">
                    <h4 className="font-medium group-hover/torneo:underline group-hover/torneo:underline-offset-4 sm:text-lg">
                        <button
                            type="button"
                            onClick={() => onAbrir(torneo)}
                            className="text-left after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:outline-none"
                        >
                            <span className="mr-1.5" aria-hidden>
                                {emojiDeJuego(torneo.juego)}
                            </span>
                            {torneo.nombre}
                        </button>
                    </h4>
                    <Insignias torneo={torneo} />
                </div>
                <Meta icon={Gamepad2}>{torneo.juego}</Meta>
                <Meta icon={Users}>
                    <span className="tabular-nums">
                        {torneo.inscritos}/{torneo.cupo} inscritos
                    </span>
                    <span className="mx-1.5">·</span>
                    <PlazasTexto libres={torneo.plazas_libres} />
                </Meta>
            </div>
        </article>
    );
}

export function Meta({
    icon: Icon,
    children,
}: {
    icon: typeof Users;
    children: React.ReactNode;
}) {
    return (
        <p className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground sm:text-base">
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{children}</span>
        </p>
    );
}

export function PlazasTexto({ libres }: { libres: number }) {
    if (libres === 1) {
        return (
            <span className="font-medium text-orange-600 dark:text-orange-400">
                ¡Última plaza!
            </span>
        );
    }

    return (
        <span
            className={cn(
                libres <= 3 && 'text-orange-600 dark:text-orange-400',
            )}
        >
            {libres} plazas libres
        </span>
    );
}

function Insignias({ torneo }: { torneo: Torneo }) {
    const ultimas = torneo.plazas_libres > 0 && torneo.plazas_libres <= 3;

    if (!torneo.inscrito && !ultimas) {
        return null;
    }

    return (
        <div className="flex shrink-0 gap-1.5">
            {torneo.inscrito && (
                <span className="rounded-md bg-lime-500/15 px-2 py-0.5 text-xs font-medium text-lime-800 dark:text-primary">
                    Inscrito
                </span>
            )}
            {ultimas && (
                <span className="rounded-md bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-700 dark:text-orange-400">
                    Últimas plazas
                </span>
            )}
        </div>
    );
}

export function PilaAvatares({
    nombres = [],
    extra = 0,
}: {
    nombres?: string[];
    extra?: number;
}) {
    const getInitials = useInitials();

    if (nombres.length === 0) {
        return null;
    }

    return (
        <div className="flex -space-x-2">
            {nombres.map((nombre, indice) => (
                <Avatar
                    key={`${nombre}-${indice}`}
                    className="size-8 ring-2 ring-background"
                    title={nombre}
                >
                    <AvatarFallback
                        className={cn(
                            'text-[10px] font-semibold',
                            [
                                'bg-lime-200 text-lime-900',
                                'bg-sky-200 text-sky-900',
                                'bg-violet-200 text-violet-900',
                                'bg-amber-200 text-amber-900',
                            ][indice % 4],
                        )}
                    >
                        {getInitials(nombre)}
                    </AvatarFallback>
                </Avatar>
            ))}
            {extra > 0 && (
                <span className="relative flex size-8 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground ring-2 ring-background">
                    +{extra}
                </span>
            )}
        </div>
    );
}

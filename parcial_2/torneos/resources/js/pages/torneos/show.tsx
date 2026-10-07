import { Head, Link } from '@inertiajs/react';
import { ChevronRight, Trophy, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { EstadoBadge } from '@/components/torneos/estado-badge';
import { Portada } from '@/components/torneos/portada';
import { PlazasTexto } from '@/components/torneos/timeline';
import { Seccion, TarjetaInscripcion } from '@/components/torneos/torneo-sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { useReloj } from '@/hooks/use-reloj';
import { formatFechaLarga, formatHora, formatRelativa } from '@/lib/format';
import { cn } from '@/lib/utils';
import { index } from '@/routes/torneos';
import type { Participante, Torneo } from '@/types';

type Props = {
    torneo: Torneo;
    participantes: Participante[];
};

const coloresAvatar = [
    'bg-lime-200 text-lime-900',
    'bg-sky-200 text-sky-900',
    'bg-violet-200 text-violet-900',
    'bg-amber-200 text-amber-900',
    'bg-rose-200 text-rose-900',
];

export default function TorneoShow({ torneo, participantes }: Props) {
    const { zona } = useReloj();
    const getInitials = useInitials();
    const fecha = new Date(torneo.fecha);
    const nombres = participantes.map((jugador) => jugador.nombre);

    return (
        <>
            <Head title={torneo.nombre} />

            <div className="mx-auto grid max-w-5xl gap-10 pt-6 md:grid-cols-[minmax(0,330px)_minmax(0,1fr)] md:gap-12">
                {/* Columna izquierda */}
                <aside className="grid content-start gap-8">
                    <Portada
                        torneo={torneo}
                        grande
                        className="w-full rounded-2xl p-6 shadow-xl"
                    />

                    <div className="flex items-center gap-3">
                        <span className="flex size-11 items-center justify-center rounded-xl border bg-background shadow-xs">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Trophy className="size-4" />
                            </span>
                        </span>
                        <div className="min-w-0">
                            <p className="text-sm text-muted-foreground">
                                Organizado por
                            </p>
                            <Link
                                href={index()}
                                className="flex items-center gap-1 font-semibold hover:underline"
                            >
                                Torneos del campus
                                <ChevronRight className="size-4 text-muted-foreground" />
                            </Link>
                        </div>
                    </div>

                    <Seccion
                        titulo={`${participantes.length} ${participantes.length === 1 ? 'inscrito' : 'inscritos'}`}
                    >
                        {participantes.length === 0 ? (
                            <p className="text-muted-foreground">
                                Aún no hay jugadores inscritos.
                            </p>
                        ) : (
                            <div className="grid gap-3">
                                <div className="flex -space-x-2">
                                    {nombres.slice(0, 5).map((nombre, i) => (
                                        <Avatar
                                            key={`${nombre}-${i}`}
                                            className="size-9 ring-2 ring-background"
                                        >
                                            <AvatarFallback
                                                className={cn(
                                                    'text-[11px] font-semibold',
                                                    coloresAvatar[
                                                        i % coloresAvatar.length
                                                    ],
                                                )}
                                            >
                                                {getInitials(nombre)}
                                            </AvatarFallback>
                                        </Avatar>
                                    ))}
                                </div>
                                <p className="text-muted-foreground">
                                    {resumenNombres(nombres)}
                                </p>
                            </div>
                        )}
                    </Seccion>

                    <div className="grid gap-3 text-muted-foreground">
                        <Link
                            href={index()}
                            className="w-fit transition-colors hover:text-foreground"
                        >
                            Ver todos los torneos
                        </Link>
                        <span className="w-fit rounded-full border px-3 py-1 text-sm">
                            # {torneo.juego}
                        </span>
                    </div>
                </aside>

                {/* Columna derecha */}
                <main className="grid min-w-0 content-start gap-7">
                    <div className="grid gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Link
                                href={index()}
                                className="flex w-fit items-center gap-2 rounded-lg bg-foreground/[0.05] px-2.5 py-1.5 text-sm transition-colors hover:bg-foreground/10"
                            >
                                <span className="flex size-5 items-center justify-center rounded bg-primary text-primary-foreground">
                                    <Trophy className="size-3" />
                                </span>
                                <span className="text-muted-foreground">
                                    Publicado en
                                </span>
                                <span className="font-medium">
                                    Torneos del campus
                                </span>
                                <ChevronRight className="size-4 text-muted-foreground" />
                            </Link>
                            {torneo.estado_visible !== 'abierto' && (
                                <EstadoBadge estado={torneo.estado_visible} />
                            )}
                        </div>
                        <h1 className="text-4xl leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl">
                            {torneo.nombre}
                        </h1>
                    </div>

                    <div className="grid gap-4">
                        <Fila
                            icono={
                                <div className="flex size-12 flex-col overflow-hidden rounded-xl border bg-background text-center">
                                    <span className="bg-foreground/[0.05] text-[10px] leading-4 font-semibold text-muted-foreground uppercase">
                                        {fecha
                                            .toLocaleDateString('es-MX', {
                                                month: 'short',
                                            })
                                            .replace('.', '')}
                                    </span>
                                    <span className="text-lg leading-7 font-semibold tabular-nums">
                                        {fecha.getDate()}
                                    </span>
                                </div>
                            }
                            titulo={formatFechaLarga(torneo.fecha)}
                            subtitulo={`${formatHora(torneo.fecha)} ${zona} · ${formatRelativa(torneo.fecha)}`}
                        />
                        <Fila
                            icono={
                                <div className="flex size-12 items-center justify-center rounded-xl border bg-background">
                                    <Users className="size-5 text-muted-foreground" />
                                </div>
                            }
                            titulo={`${torneo.inscritos} de ${torneo.cupo} plazas ocupadas`}
                            subtitulo={
                                <>
                                    {torneo.juego} ·{' '}
                                    <PlazasTexto
                                        libres={torneo.plazas_libres}
                                    />
                                </>
                            }
                        />
                    </div>

                    <TarjetaInscripcion torneo={torneo} />

                    <Seccion titulo="Acerca del torneo">
                        {torneo.descripcion ? (
                            <p className="text-lg leading-relaxed whitespace-pre-line">
                                {torneo.descripcion}
                            </p>
                        ) : (
                            <p className="text-muted-foreground">
                                Este torneo no tiene descripción.
                            </p>
                        )}
                    </Seccion>

                    <Seccion titulo="Participantes">
                        {participantes.length === 0 ? (
                            <p className="text-muted-foreground">
                                ¡Sé el primero en inscribirte!
                            </p>
                        ) : (
                            <ol className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                                {participantes.map((jugador, posicion) => (
                                    <li
                                        key={jugador.id}
                                        className="flex items-center gap-3"
                                    >
                                        <span className="w-5 text-right text-sm text-muted-foreground tabular-nums">
                                            {posicion + 1}
                                        </span>
                                        <Avatar className="size-8">
                                            <AvatarFallback
                                                className={cn(
                                                    'text-[11px] font-semibold',
                                                    coloresAvatar[
                                                        posicion %
                                                            coloresAvatar.length
                                                    ],
                                                )}
                                            >
                                                {getInitials(jugador.nombre)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="truncate font-medium">
                                            {jugador.nombre}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </Seccion>
                </main>
            </div>
        </>
    );
}

function resumenNombres(nombres: string[]): string {
    if (nombres.length <= 2) {
        return nombres.join(' y ');
    }

    const resto = nombres.length - 2;

    return `${nombres[0]}, ${nombres[1]} y ${resto} más`;
}

function Fila({
    icono,
    titulo,
    subtitulo,
}: {
    icono: ReactNode;
    titulo: string;
    subtitulo: ReactNode;
}) {
    return (
        <div className="flex items-center gap-4">
            {icono}
            <div className="min-w-0">
                <p className="text-lg font-semibold">{titulo}</p>
                <p className="text-muted-foreground">{subtitulo}</p>
            </div>
        </div>
    );
}

import { Head, Link } from '@inertiajs/react';
import { CalendarClock, Gamepad2, History, Users } from 'lucide-react';
import { useState } from 'react';
import { ConfirmarAccion } from '@/components/torneos/confirmar-accion';
import { EstadoBadge } from '@/components/torneos/estado-badge';
import { Portada } from '@/components/torneos/portada';
import {
    agruparPorDia,
    Meta,
    PilaAvatares,
    PlazasTexto,
} from '@/components/torneos/timeline';
import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { formatDiaMes, formatDiaSemana, formatHora } from '@/lib/format';
import { cn } from '@/lib/utils';
import { destroy as cancelar } from '@/routes/inscripciones';
import { index, show } from '@/routes/torneos';
import type { MiInscripcion, Torneo } from '@/types';

type Props = {
    inscripciones: MiInscripcion[];
};

type Pestana = 'proximos' | 'pasados';

export default function MisTorneos({ inscripciones }: Props) {
    const [pestana, setPestana] = useState<Pestana>('proximos');

    const proximos = inscripciones.filter((item) => item.puede_cancelar);
    const pasados = inscripciones
        .filter((item) => !item.puede_cancelar)
        .reverse();
    const visibles = pestana === 'proximos' ? proximos : pasados;
    const grupos = agruparPorDia(visibles.map((item) => item.torneo));

    return (
        <>
            <Head title="Mis torneos" />

            <div className="mx-auto max-w-4xl pt-6">
                <div className="mb-10 flex items-center justify-between gap-4">
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                        Mis torneos
                    </h1>
                    <div
                        role="tablist"
                        aria-label="Filtrar torneos"
                        className="flex rounded-xl bg-foreground/[0.05] p-1"
                    >
                        <BotonPestana
                            activa={pestana === 'proximos'}
                            onClick={() => setPestana('proximos')}
                        >
                            Próximos
                        </BotonPestana>
                        <BotonPestana
                            activa={pestana === 'pasados'}
                            onClick={() => setPestana('pasados')}
                        >
                            Pasados
                        </BotonPestana>
                    </div>
                </div>

                {grupos.length === 0 ? (
                    <Vacio pestana={pestana} />
                ) : (
                    <div className="grid gap-10">
                        {grupos.map((grupo) => (
                            <section
                                key={grupo.clave}
                                className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)] md:gap-0"
                            >
                                <div className="relative md:pr-10">
                                    <p className="font-semibold">
                                        {formatDiaMes(grupo.fecha)}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {formatDiaSemana(grupo.fecha)}
                                    </p>
                                    <span className="absolute top-1.5 right-[-4px] hidden size-2 rounded-full bg-muted-foreground/30 md:block" />
                                    <span className="absolute top-5 right-[-1px] bottom-0 hidden border-l border-dashed border-muted-foreground/25 md:block" />
                                </div>
                                <div className="grid gap-4 md:pl-10">
                                    {grupo.torneos.map((torneo) => (
                                        <TarjetaInscripcion
                                            key={torneo.id}
                                            torneo={torneo}
                                            puedeCancelar={
                                                pestana === 'proximos'
                                            }
                                        />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function TarjetaInscripcion({
    torneo,
    puedeCancelar,
}: {
    torneo: Torneo;
    puedeCancelar: boolean;
}) {
    const nombres = (torneo.participantes ?? []).slice(0, 4);

    return (
        <article className="group/torneo relative flex gap-4 rounded-2xl bg-background p-4 shadow-xs ring-1 ring-black/[0.04] transition-shadow hover:shadow-md sm:p-5 dark:ring-white/5">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="text-sm text-muted-foreground tabular-nums">
                    {formatHora(torneo.fecha)}
                </p>
                <h2 className="text-lg leading-snug font-semibold text-balance sm:text-xl">
                    <Link
                        href={show(torneo.id)}
                        prefetch
                        className="after:absolute after:inset-0 after:rounded-2xl after:content-['']"
                    >
                        {torneo.nombre}
                    </Link>
                </h2>
                <Meta icon={Gamepad2}>{torneo.juego}</Meta>
                <Meta icon={Users}>
                    <span className="tabular-nums">
                        {torneo.inscritos}/{torneo.cupo} inscritos
                    </span>
                    {puedeCancelar && (
                        <>
                            <span className="mx-1.5">·</span>
                            <PlazasTexto libres={torneo.plazas_libres} />
                        </>
                    )}
                </Meta>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                    {puedeCancelar ? (
                        <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                            Inscrito
                        </span>
                    ) : (
                        <EstadoBadge estado={torneo.estado_visible} />
                    )}
                    <PilaAvatares
                        nombres={nombres}
                        extra={torneo.inscritos - nombres.length}
                    />
                    {puedeCancelar && (
                        <div className="relative z-10 ml-auto">
                            <ConfirmarAccion
                                trigger={
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        Cancelar inscripción
                                    </Button>
                                }
                                title="¿Cancelar tu inscripción?"
                                description={`Liberarás tu plaza en «${torneo.nombre}». Podrás volver a inscribirte mientras queden lugares.`}
                                confirmLabel="Sí, cancelar"
                                action={cancelar(torneo.id)}
                            />
                        </div>
                    )}
                </div>
            </div>
            <Portada
                torneo={torneo}
                className={cn(
                    'size-24 sm:size-36',
                    !puedeCancelar && 'opacity-60 grayscale-[40%]',
                )}
            />
        </article>
    );
}

function BotonPestana({
    activa,
    onClick,
    children,
}: {
    activa: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={activa}
            onClick={onClick}
            className={cn(
                'rounded-lg px-4 py-1.5 text-sm font-medium transition-all',
                activa
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
            )}
        >
            {children}
        </button>
    );
}

function Vacio({ pestana }: { pestana: Pestana }) {
    const proximos = pestana === 'proximos';

    return (
        <Empty className="rounded-2xl border border-dashed bg-background/60">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    {proximos ? <CalendarClock /> : <History />}
                </EmptyMedia>
                <EmptyTitle>
                    {proximos
                        ? 'No tienes torneos próximos'
                        : 'Aún no tienes historial'}
                </EmptyTitle>
                <EmptyDescription>
                    {proximos
                        ? 'Explora los torneos disponibles y aparta tu lugar.'
                        : 'Aquí aparecerán los torneos que ya se realizaron.'}
                </EmptyDescription>
            </EmptyHeader>
            {proximos && (
                <EmptyContent>
                    <Button asChild>
                        <Link href={index()}>Descubrir torneos</Link>
                    </Button>
                </EmptyContent>
            )}
        </Empty>
    );
}

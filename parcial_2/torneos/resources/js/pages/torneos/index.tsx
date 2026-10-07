import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Clock,
    Link2,
    List,
    ListChecks,
    PanelsTopLeft,
    Plus,
    Search,
    SearchX,
    Trophy,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import { Calendario } from '@/components/torneos/calendario';
import { Timeline } from '@/components/torneos/timeline';
import { TorneoSheet } from '@/components/torneos/torneo-sheet';
import type { Vista } from '@/components/torneos/timeline';
import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useClipboard } from '@/hooks/use-clipboard';
import { useReloj } from '@/hooks/use-reloj';
import { claveDia, formatDiaMes } from '@/lib/format';
import { cn } from '@/lib/utils';
import { misTorneos, register } from '@/routes';
import { create } from '@/routes/admin/torneos';
import { index } from '@/routes/torneos';
import type { JuegoConTotal, Torneo } from '@/types';

type Props = {
    torneos: Torneo[];
    juegos: JuegoConTotal[];
    filtros: { buscar: string; juego: string };
};

const CLAVE_VISTA = 'torneos:vista';

export default function TorneosIndex({ torneos, juegos, filtros }: Props) {
    const [vista, setVista] = useState<Vista>(() =>
        typeof window !== 'undefined' &&
        window.localStorage.getItem(CLAVE_VISTA) === 'lista'
            ? 'lista'
            : 'tarjetas',
    );
    const [buscando, setBuscando] = useState(filtros.buscar !== '');
    const [buscar, setBuscar] = useState(filtros.buscar);
    const [dia, setDia] = useState<string | null>(null);
    const [abiertoId, setAbiertoId] = useState<number | null>(null);

    const fechasConTorneo = useMemo(
        () =>
            new Set(torneos.map((torneo) => claveDia(new Date(torneo.fecha)))),
        [torneos],
    );
    const visibles = dia
        ? torneos.filter((torneo) => claveDia(new Date(torneo.fecha)) === dia)
        : torneos;
    const posicion = visibles.findIndex((torneo) => torneo.id === abiertoId);
    const torneoAbierto = posicion >= 0 ? visibles[posicion] : null;
    const hayFiltros = filtros.buscar !== '' || filtros.juego !== '';

    const cambiarVista = (nueva: Vista) => {
        setVista(nueva);
        window.localStorage.setItem(CLAVE_VISTA, nueva);
    };

    const filtrar = (valores: { buscar?: string; juego?: string }) => {
        const query = { ...filtros, ...valores };
        setDia(null);

        router.get(
            index.url({
                query: {
                    buscar: query.buscar || undefined,
                    juego: query.juego || undefined,
                },
            }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const enviarBusqueda = (event: FormEvent) => {
        event.preventDefault();
        filtrar({ buscar });
    };

    const limpiar = () => {
        setBuscar('');
        setBuscando(false);
        filtrar({ buscar: '', juego: '' });
    };

    return (
        <>
            <Head title="Torneos disponibles" />

            <Portada />

            <div className="relative left-1/2 mt-8 w-screen -translate-x-1/2 border-t" />

            <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
                <section className="min-w-0 sm:px-4 lg:px-0 lg:pl-14">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Torneos
                        </h2>
                        <div className="flex items-center gap-2">
                            <div className="flex rounded-lg bg-muted p-0.5">
                                <BotonVista
                                    activo={vista === 'tarjetas'}
                                    etiqueta="Vista de tarjetas"
                                    onClick={() => cambiarVista('tarjetas')}
                                >
                                    <PanelsTopLeft />
                                </BotonVista>
                                <BotonVista
                                    activo={vista === 'lista'}
                                    etiqueta="Vista de lista"
                                    onClick={() => cambiarVista('lista')}
                                >
                                    <List />
                                </BotonVista>
                            </div>
                            <Button
                                variant="secondary"
                                size="icon-sm"
                                className={cn(
                                    'rounded-lg',
                                    buscando && 'bg-foreground/10',
                                )}
                                aria-label="Buscar torneos"
                                aria-expanded={buscando}
                                onClick={() => setBuscando(!buscando)}
                            >
                                <Search />
                            </Button>
                        </div>
                    </div>

                    {buscando && (
                        <form
                            onSubmit={enviarBusqueda}
                            role="search"
                            className="mb-4 animate-in fade-in-0 slide-in-from-top-1"
                        >
                            <InputGroup className="h-10 bg-background">
                                <InputGroupAddon>
                                    <Search />
                                </InputGroupAddon>
                                <InputGroupInput
                                    autoFocus
                                    value={buscar}
                                    onChange={(event) =>
                                        setBuscar(event.target.value)
                                    }
                                    placeholder="Buscar por nombre o juego y presiona Enter…"
                                    aria-label="Buscar torneos"
                                />
                                {buscar !== '' && (
                                    <InputGroupAddon align="inline-end">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xs"
                                            aria-label="Limpiar búsqueda"
                                            onClick={() => {
                                                setBuscar('');
                                                filtrar({ buscar: '' });
                                            }}
                                        >
                                            <X />
                                        </Button>
                                    </InputGroupAddon>
                                )}
                            </InputGroup>
                        </form>
                    )}

                    {juegos.length > 0 && (
                        <div className="mb-6 flex flex-wrap gap-2">
                            {juegos.map((juego) => {
                                const activo = filtros.juego === juego.nombre;

                                return (
                                    <button
                                        key={juego.nombre}
                                        type="button"
                                        aria-pressed={activo}
                                        onClick={() =>
                                            filtrar({
                                                juego: activo
                                                    ? ''
                                                    : juego.nombre,
                                            })
                                        }
                                        className={cn(
                                            'rounded-full border px-3 py-1 text-sm transition-colors',
                                            activo
                                                ? 'border-foreground bg-foreground text-background'
                                                : 'bg-background text-foreground/80 hover:border-foreground/30',
                                        )}
                                    >
                                        {juego.nombre}
                                        <span
                                            className={cn(
                                                'ml-1.5 tabular-nums',
                                                activo
                                                    ? 'text-background/60'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {juego.total}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {dia && (
                        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                            Mostrando el{' '}
                            {formatDiaMes(new Date(`${dia}T12:00`))}
                            <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => setDia(null)}
                            >
                                <X />
                                Ver todos
                            </Button>
                        </div>
                    )}

                    {visibles.length > 0 ? (
                        <Timeline
                            torneos={visibles}
                            vista={vista}
                            activo={abiertoId}
                            onAbrir={(torneo) => setAbiertoId(torneo.id)}
                        />
                    ) : (
                        <Empty className="rounded-2xl border bg-background">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    {hayFiltros ? <SearchX /> : <Trophy />}
                                </EmptyMedia>
                                <EmptyTitle>
                                    {hayFiltros
                                        ? 'Ningún torneo coincide con tu búsqueda'
                                        : 'No hay torneos disponibles'}
                                </EmptyTitle>
                                <EmptyDescription>
                                    {hayFiltros
                                        ? 'Prueba con otro nombre o quita los filtros.'
                                        : 'Por ahora no hay torneos abiertos con plazas libres. Vuelve pronto.'}
                                </EmptyDescription>
                            </EmptyHeader>
                            {hayFiltros && (
                                <EmptyContent>
                                    <Button variant="outline" onClick={limpiar}>
                                        Quitar filtros
                                    </Button>
                                </EmptyContent>
                            )}
                        </Empty>
                    )}
                </section>

                <aside className="grid content-start gap-4 lg:sticky lg:top-20 lg:pr-14">
                    <Acciones />
                    <Calendario
                        fechasConTorneo={fechasConTorneo}
                        seleccionado={dia}
                        onSeleccionar={setDia}
                        mesInicial={
                            torneos[0] ? new Date(torneos[0].fecha) : undefined
                        }
                    />
                    <Resumen torneos={torneos} />
                </aside>
            </div>

            <TorneoSheet
                torneo={torneoAbierto}
                onCerrar={() => setAbiertoId(null)}
                onAnterior={
                    posicion > 0
                        ? () => setAbiertoId(visibles[posicion - 1].id)
                        : undefined
                }
                onSiguiente={
                    posicion >= 0 && posicion < visibles.length - 1
                        ? () => setAbiertoId(visibles[posicion + 1].id)
                        : undefined
                }
            />
        </>
    );
}

function Portada() {
    const { auth } = usePage().props;
    const { hora, zona } = useReloj();

    return (
        <section>
            <div className="relative overflow-hidden rounded-3xl border bg-background bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[44px_44px] shadow-xs">
                <div className="relative z-10 px-6 pt-10 pb-20 sm:px-12 sm:pt-12 sm:pb-16 md:pr-56 md:pl-[40%]">
                    <p className="mb-4 flex gap-1 text-2xl" aria-hidden>
                        <span className="-rotate-12">⚽</span>
                        <span className="rotate-6">🎮</span>
                        <span className="-rotate-6">🏀</span>
                    </p>
                    <h1 className="max-w-xl text-4xl leading-[1.08] font-bold tracking-tight text-balance sm:text-5xl">
                        Compite, juega y{' '}
                        <span className="-mx-1 rounded-lg bg-primary/70 box-decoration-clone px-2">
                            gana
                        </span>{' '}
                        en los mejores torneos.
                    </h1>
                    <p className="mt-5 text-lg text-muted-foreground">
                        Fútbol, básquet, videojuegos y más. Inscripción 100%
                        gratis ✨
                    </p>
                </div>
                <div
                    aria-hidden
                    className="pointer-events-none absolute -right-28 -bottom-32 hidden size-80 rounded-full bg-[radial-gradient(circle_at_30%_30%,var(--color-lime-200),var(--color-lime-400)_45%,var(--color-emerald-600))] opacity-90 shadow-2xl md:block"
                />
                <span
                    aria-hidden
                    className="pointer-events-none absolute top-8 right-10 hidden rotate-12 text-4xl md:block"
                >
                    🏆
                </span>
                <span
                    aria-hidden
                    className="pointer-events-none absolute bottom-36 left-[34%] hidden -rotate-12 text-3xl lg:block"
                >
                    🚀
                </span>
            </div>

            <div className="px-6 sm:px-14">
                <div className="-mt-12 flex items-end justify-between gap-4">
                    <div className="relative z-10 flex size-24 items-center justify-center rounded-2xl border bg-background p-2 shadow-md">
                        <div className="flex size-full items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <Trophy className="size-10" strokeWidth={1.75} />
                        </div>
                    </div>
                    {auth.isAdmin ? (
                        <Button asChild size="lg">
                            <Link href={create()}>
                                <Plus />
                                Nuevo torneo
                            </Link>
                        </Button>
                    ) : auth.user ? (
                        <Button asChild size="lg">
                            <Link href={misTorneos()}>
                                <ListChecks />
                                Mis torneos
                            </Link>
                        </Button>
                    ) : (
                        <Button asChild size="lg">
                            <Link href={register()}>Unirme como jugador</Link>
                        </Button>
                    )}
                </div>

                <h2 className="mt-6 text-4xl font-bold tracking-tight">
                    Torneos
                </h2>
                <p className="mt-3 flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-4" />
                    Horarios en {zona}
                    <span className="text-muted-foreground/60">— {hora}</span>
                </p>
                <p className="mt-3 max-w-2xl text-foreground/80">
                    La comunidad donde se organizan y juegan los torneos del
                    campus. Elige uno, aparta tu lugar y prepárate para
                    competir.
                </p>
            </div>
        </section>
    );
}

function BotonVista({
    activo,
    etiqueta,
    onClick,
    children,
}: {
    activo: boolean;
    etiqueta: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    aria-label={etiqueta}
                    aria-pressed={activo}
                    onClick={onClick}
                    className={cn(
                        'flex size-8 items-center justify-center rounded-md text-muted-foreground transition-all [&_svg]:size-4',
                        activo
                            ? 'bg-background text-foreground shadow-sm'
                            : 'hover:text-foreground',
                    )}
                >
                    {children}
                </button>
            </TooltipTrigger>
            <TooltipContent>{etiqueta}</TooltipContent>
        </Tooltip>
    );
}

function Acciones() {
    const { auth } = usePage().props;
    const [, copiar] = useClipboard();

    const compartir = async () => {
        if (await copiar(window.location.href)) {
            toast.success('Enlace copiado al portapapeles.');
        }
    };

    return (
        <div className="flex gap-2">
            <Button variant="secondary" className="flex-1 rounded-lg" asChild>
                {auth.isAdmin ? (
                    <Link href={create()}>
                        <Plus />
                        Nuevo torneo
                    </Link>
                ) : auth.user ? (
                    <Link href={misTorneos()}>
                        <ListChecks />
                        Mis torneos
                    </Link>
                ) : (
                    <Link href={register()}>
                        <Plus />
                        Crear cuenta de jugador
                    </Link>
                )}
            </Button>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-lg"
                        aria-label="Copiar enlace"
                        onClick={compartir}
                    >
                        <Link2 />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Copiar enlace</TooltipContent>
            </Tooltip>
        </div>
    );
}

function Resumen({ torneos }: { torneos: Torneo[] }) {
    const plazas = torneos.reduce(
        (total, torneo) => total + torneo.plazas_libres,
        0,
    );
    const juegos = new Set(torneos.map((torneo) => torneo.juego)).size;

    const datos = [
        { valor: torneos.length, etiqueta: 'torneos' },
        { valor: plazas, etiqueta: 'plazas libres' },
        { valor: juegos, etiqueta: juegos === 1 ? 'juego' : 'juegos' },
    ];

    return (
        <div className="grid grid-cols-3 divide-x rounded-2xl border bg-background py-4 text-center shadow-xs">
            {datos.map((dato) => (
                <div key={dato.etiqueta}>
                    <p className="text-xl font-semibold tabular-nums">
                        {dato.valor}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {dato.etiqueta}
                    </p>
                </div>
            ))}
        </div>
    );
}

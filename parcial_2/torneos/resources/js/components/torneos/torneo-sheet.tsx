import { Link, router, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    ChevronDown,
    ChevronsRight,
    ChevronUp,
    CircleMinus,
    Copy,
    Gamepad2,
    LogIn,
    UserCheck,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { ConfirmarAccion } from '@/components/torneos/confirmar-accion';
import { Portada } from '@/components/torneos/portada';
import { PlazasTexto } from '@/components/torneos/timeline';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useClipboard } from '@/hooks/use-clipboard';
import { useInitials } from '@/hooks/use-initials';
import { useReloj } from '@/hooks/use-reloj';
import { formatFechaLarga, formatHora, formatRelativa } from '@/lib/format';
import { login } from '@/routes';
import { edit as editar, show as gestionar } from '@/routes/admin/torneos';
import {
    destroy as cancelar,
    store as inscribirse,
} from '@/routes/inscripciones';
import { show } from '@/routes/torneos';
import type { Torneo } from '@/types';

type Props = {
    torneo: Torneo | null;
    onCerrar: () => void;
    onAnterior?: () => void;
    onSiguiente?: () => void;
};

/**
 * Panel lateral con la vista rápida de un torneo, al estilo de Luma.
 */
export function TorneoSheet({
    torneo,
    onCerrar,
    onAnterior,
    onSiguiente,
}: Props) {
    const [, copiar] = useClipboard();

    const copiarEnlace = async () => {
        if (
            torneo &&
            (await copiar(
                new URL(show.url(torneo.id), window.location.origin).href,
            ))
        ) {
            toast.success('Enlace copiado al portapapeles.');
        }
    };

    return (
        <Sheet
            open={torneo !== null}
            onOpenChange={(abierto) => !abierto && onCerrar()}
        >
            <SheetContent
                side="right"
                showCloseButton={false}
                overlayClassName="bg-background/40 backdrop-blur-none supports-backdrop-filter:backdrop-blur-none"
                className="gap-0 overflow-hidden border bg-[#f8f8f8] p-0 shadow-2xl data-[side=right]:inset-y-2 data-[side=right]:right-2 data-[side=right]:h-auto data-[side=right]:w-[calc(100%-1rem)] data-[side=right]:rounded-2xl data-[side=right]:sm:max-w-[560px] dark:bg-card"
            >
                {torneo && (
                    <>
                        <div className="flex items-center gap-2 border-b bg-background/80 px-3 py-2.5 backdrop-blur">
                            <BotonBarra
                                etiqueta="Cerrar panel"
                                onClick={onCerrar}
                                soloIcono
                            >
                                <ChevronsRight />
                            </BotonBarra>
                            <BotonBarra
                                etiqueta="Copiar enlace"
                                onClick={copiarEnlace}
                            >
                                <Copy />
                                Copiar enlace
                            </BotonBarra>
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="rounded-lg bg-foreground/[0.05] hover:bg-foreground/10"
                            >
                                <Link href={show(torneo.id)}>
                                    Página del torneo
                                    <ArrowUpRight />
                                </Link>
                            </Button>
                            <div className="ml-auto flex gap-1">
                                <BotonBarra
                                    etiqueta="Torneo anterior"
                                    onClick={onAnterior}
                                    soloIcono
                                >
                                    <ChevronUp />
                                </BotonBarra>
                                <BotonBarra
                                    etiqueta="Torneo siguiente"
                                    onClick={onSiguiente}
                                    soloIcono
                                >
                                    <ChevronDown />
                                </BotonBarra>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <Contenido key={torneo.id} torneo={torneo} />
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

function Contenido({ torneo }: { torneo: Torneo }) {
    const { zona } = useReloj();
    const getInitials = useInitials();
    const fecha = new Date(torneo.fecha);
    const participantes = torneo.participantes ?? [];

    return (
        <div className="grid gap-6 px-5 pt-8 pb-10 sm:px-6">
            <Portada
                torneo={torneo}
                grande
                className="mx-auto size-64 rounded-2xl p-6 shadow-xl sm:size-72"
            />

            <div className="grid gap-2">
                <SheetTitle className="text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl">
                    {torneo.nombre}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-2 text-base">
                    <Gamepad2 className="size-4" />
                    {torneo.juego}
                </SheetDescription>
            </div>

            <div className="grid gap-4">
                <Fila
                    icono={
                        <div className="flex size-11 flex-col overflow-hidden rounded-lg border bg-background text-center">
                            <span className="bg-foreground/[0.05] text-[9px] leading-4 font-semibold text-muted-foreground uppercase">
                                {fecha
                                    .toLocaleDateString('es-MX', {
                                        month: 'short',
                                    })
                                    .replace('.', '')}
                            </span>
                            <span className="text-base leading-6 font-semibold tabular-nums">
                                {fecha.getDate()}
                            </span>
                        </div>
                    }
                    titulo={formatFechaLarga(torneo.fecha)}
                    subtitulo={`${formatHora(torneo.fecha)} ${zona} · ${formatRelativa(torneo.fecha)}`}
                />
                <Fila
                    icono={
                        <div className="flex size-11 items-center justify-center rounded-lg border bg-background">
                            <Users className="size-5 text-muted-foreground" />
                        </div>
                    }
                    titulo={`${torneo.inscritos} de ${torneo.cupo} plazas ocupadas`}
                    subtitulo={<PlazasTexto libres={torneo.plazas_libres} />}
                />
            </div>

            <TarjetaInscripcion torneo={torneo} />

            <Seccion titulo="Acerca del torneo">
                {torneo.descripcion ? (
                    <p className="text-base leading-relaxed whitespace-pre-line">
                        {torneo.descripcion}
                    </p>
                ) : (
                    <p className="text-muted-foreground">
                        Este torneo no tiene descripción.
                    </p>
                )}
            </Seccion>

            <Seccion titulo={`Participantes · ${participantes.length}`}>
                {participantes.length === 0 ? (
                    <p className="text-muted-foreground">
                        Aún no hay jugadores inscritos. ¡Sé el primero!
                    </p>
                ) : (
                    <ul className="grid gap-3">
                        {participantes.map((nombre, indice) => (
                            <li
                                key={`${nombre}-${indice}`}
                                className="flex items-center gap-3"
                            >
                                <Avatar className="size-8">
                                    <AvatarFallback className="bg-primary/20 text-xs font-semibold">
                                        {getInitials(nombre)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-base font-medium">
                                    {nombre}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </Seccion>

            <span className="w-fit rounded-full border px-3 py-1 text-sm text-muted-foreground">
                # {torneo.juego}
            </span>
        </div>
    );
}

export function TarjetaInscripcion({ torneo }: { torneo: Torneo }) {
    const { auth } = usePage().props;
    const getInitials = useInitials();
    const [procesando, setProcesando] = useState(false);

    const inscribir = () => {
        router.visit(inscribirse(torneo.id), {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setProcesando(true),
            onFinish: () => setProcesando(false),
        });
    };

    let contenido: ReactNode;

    if (auth.isAdmin) {
        contenido = (
            <>
                <Estado icono={<Users />} titulo="Vista de administrador">
                    Los administradores no se inscriben, pero puedes ver y dar
                    de baja a los participantes.
                </Estado>
                <Button
                    asChild
                    variant="secondary"
                    size="lg"
                    className="w-full"
                >
                    <Link href={gestionar(torneo.id)}>Gestionar inscritos</Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="w-full">
                    <Link href={editar(torneo.id)}>Editar torneo</Link>
                </Button>
            </>
        );
    } else if (!auth.user) {
        contenido = (
            <>
                <Estado
                    icono={<LogIn />}
                    titulo="Inicia sesión para inscribirte"
                >
                    Necesitas una cuenta de jugador para apartar tu lugar.
                </Estado>
                <Button asChild size="lg" className="w-full">
                    <Link href={login()}>Iniciar sesión</Link>
                </Button>
            </>
        );
    } else if (torneo.inscrito && torneo.estado_visible === 'finalizado') {
        contenido = (
            <Estado
                icono={
                    <UserCheck className="text-lime-600 dark:text-primary" />
                }
                titulo="Participaste en este torneo"
            >
                El torneo ya se realizó, así que tu inscripción no se puede
                cancelar.
            </Estado>
        );
    } else if (torneo.inscrito) {
        contenido = (
            <>
                <Estado
                    icono={
                        <UserCheck className="text-lime-600 dark:text-primary" />
                    }
                    titulo="Ya estás inscrito"
                >
                    Tu lugar está apartado. Puedes cancelar hasta la fecha del
                    torneo y tu plaza quedará libre.
                </Estado>
                <ConfirmarAccion
                    trigger={
                        <Button variant="outline" size="lg" className="w-full">
                            Cancelar inscripción
                        </Button>
                    }
                    title="¿Cancelar tu inscripción?"
                    description={`Liberarás tu plaza en «${torneo.nombre}».`}
                    confirmLabel="Sí, cancelar"
                    action={cancelar(torneo.id)}
                />
            </>
        );
    } else if (torneo.estado_visible !== 'abierto') {
        contenido = (
            <Estado icono={<CircleMinus />} titulo="Inscripciones cerradas">
                {torneo.estado_visible === 'lleno'
                    ? 'El torneo está lleno: ya no quedan plazas disponibles.'
                    : 'Este torneo no está aceptando inscripciones.'}
            </Estado>
        );
    } else {
        contenido = (
            <>
                <p className="text-base">
                    ¡Hola, {auth.user.name.split(' ')[0]}! Para participar,
                    inscríbete abajo.{' '}
                    <span className="text-muted-foreground">
                        {torneo.plazas_libres === 1
                            ? 'Queda la última plaza.'
                            : `Quedan ${torneo.plazas_libres} plazas.`}
                    </span>
                </p>
                <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar className="size-7">
                        <AvatarFallback className="bg-primary/20 text-[10px] font-semibold">
                            {getInitials(auth.user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="truncate font-medium">
                        {auth.user.name}{' '}
                        <span className="font-normal text-muted-foreground">
                            {auth.user.email}
                        </span>
                    </span>
                </div>
                <Button
                    size="lg"
                    className="h-11 w-full text-base"
                    onClick={inscribir}
                    disabled={procesando}
                >
                    {procesando && <Spinner />}
                    Inscribirme con un clic
                </Button>
            </>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border bg-background shadow-xs">
            <p className="bg-foreground/[0.04] px-5 py-2.5 text-sm font-medium text-muted-foreground">
                Inscripción
            </p>
            <div className="grid gap-4 p-5">{contenido}</div>
        </div>
    );
}

function Estado({
    icono,
    titulo,
    children,
}: {
    icono: ReactNode;
    titulo: string;
    children: ReactNode;
}) {
    return (
        <div className="grid gap-1.5">
            <p className="flex items-center gap-2.5 text-lg font-semibold [&_svg]:size-5">
                {icono}
                {titulo}
            </p>
            <p className="text-muted-foreground">{children}</p>
        </div>
    );
}

export function Fila({
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
                <p className="text-base font-semibold">{titulo}</p>
                <p className="text-sm text-muted-foreground">{subtitulo}</p>
            </div>
        </div>
    );
}

export function Seccion({
    titulo,
    children,
}: {
    titulo: string;
    children: ReactNode;
}) {
    return (
        <section className="grid gap-3">
            <h3 className="border-b pb-2 text-sm font-medium text-muted-foreground">
                {titulo}
            </h3>
            {children}
        </section>
    );
}

function BotonBarra({
    etiqueta,
    onClick,
    soloIcono = false,
    children,
}: {
    etiqueta: string;
    onClick?: () => void;
    soloIcono?: boolean;
    children: ReactNode;
}) {
    const boton = (
        <Button
            type="button"
            variant="ghost"
            size={soloIcono ? 'icon-sm' : 'sm'}
            onClick={onClick}
            disabled={!onClick}
            aria-label={etiqueta}
            className="rounded-lg bg-foreground/[0.05] hover:bg-foreground/10 disabled:opacity-40"
        >
            {children}
        </Button>
    );

    if (!soloIcono) {
        return boton;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{boton}</TooltipTrigger>
            <TooltipContent>{etiqueta}</TooltipContent>
        </Tooltip>
    );
}

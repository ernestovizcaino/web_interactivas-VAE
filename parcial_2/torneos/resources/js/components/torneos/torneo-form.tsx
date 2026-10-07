import { Form, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    Gamepad2,
    Globe,
    Lock,
    LockOpen,
    PencilLine,
    Shuffle,
    Text,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import { emojiDeJuego, Portada } from '@/components/torneos/portada';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { useReloj } from '@/hooks/use-reloj';
import { cn } from '@/lib/utils';
import { store, update } from '@/routes/admin/torneos';
import type { Torneo } from '@/types';

const juegosSugeridos = [
    'Fútbol',
    'Básquetbol',
    'Voleibol',
    'Ajedrez',
    'FIFA 26',
    'Valorant',
    'League of Legends',
    'Rocket League',
    'Tenis de mesa',
];

function fechaPorDefecto(): { dia: string; hora: string } {
    const manana = new Date();
    manana.setDate(manana.getDate() + 7);
    const mes = String(manana.getMonth() + 1).padStart(2, '0');
    const dia = String(manana.getDate()).padStart(2, '0');

    return { dia: `${manana.getFullYear()}-${mes}-${dia}`, hora: '18:00' };
}

const nombreZona = Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * Formulario de torneo al estilo "crear evento": portada en vivo a la izquierda y
 * campos en bloques a la derecha.
 */
export function TorneoForm({ torneo }: { torneo?: Torneo }) {
    const { auth } = usePage().props;
    const { zona } = useReloj();
    const editando = torneo !== undefined;
    const minimoCupo = Math.max(2, torneo?.inscritos ?? 0);
    const inicial = torneo
        ? {
              dia: torneo.fecha_local.slice(0, 10),
              hora: torneo.fecha_local.slice(11, 16),
          }
        : fechaPorDefecto();

    const [nombre, setNombre] = useState(torneo?.nombre ?? '');
    const [juego, setJuego] = useState(torneo?.juego ?? '');
    const [dia, setDia] = useState(inicial.dia);
    const [hora, setHora] = useState(inicial.hora);
    const [cupo, setCupo] = useState(String(torneo?.cupo ?? 16));
    const [abierto, setAbierto] = useState(
        (torneo?.estado ?? 'abierto') === 'abierto',
    );
    const [conDescripcion, setConDescripcion] = useState(
        Boolean(torneo?.descripcion),
    );

    const juegoAleatorio = () => {
        const opciones = juegosSugeridos.filter((opcion) => opcion !== juego);
        setJuego(opciones[Math.floor(Math.random() * opciones.length)]);
    };

    return (
        <Form
            {...(editando ? update.form(torneo.id) : store.form())}
            disableWhileProcessing
            noValidate
            className="grid gap-8 md:grid-cols-[minmax(0,330px)_minmax(0,1fr)] md:gap-10"
        >
            {({ processing, errors }) => (
                <>
                    <input
                        type="hidden"
                        name="fecha"
                        value={dia && hora ? `${dia}T${hora}` : ''}
                    />
                    <input
                        type="hidden"
                        name="estado"
                        value={abierto ? 'abierto' : 'cerrado'}
                    />

                    {/* Columna izquierda: portada en vivo */}
                    <div className="grid content-start gap-4">
                        <div>
                            <Portada
                                torneo={{
                                    nombre: nombre || 'Nombre del torneo',
                                    juego: juego || 'Torneo',
                                }}
                                grande
                                className="w-full rounded-2xl p-6 shadow-md"
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex flex-1 items-center gap-3 rounded-xl bg-foreground/[0.05] px-3 py-2.5">
                                <span className="flex size-9 items-center justify-center rounded-lg bg-background text-xl shadow-xs">
                                    {emojiDeJuego(juego)}
                                </span>
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground">
                                        Portada
                                    </p>
                                    <p className="truncate font-medium">
                                        {juego || 'Elige un juego'}
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={juegoAleatorio}
                                aria-label="Juego al azar"
                                className="h-auto rounded-xl bg-foreground/[0.05] px-4 hover:bg-foreground/10"
                            >
                                <Shuffle />
                            </Button>
                        </div>
                        <p className="px-1 text-xs text-muted-foreground">
                            La portada se genera a partir del juego y del
                            nombre.
                        </p>
                    </div>

                    {/* Columna derecha: datos del torneo */}
                    <div className="grid content-start gap-4">
                        <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2 rounded-lg bg-foreground/[0.05] px-3 py-1.5 text-sm font-medium">
                                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                    {auth.user?.name.charAt(0)}
                                </span>
                                Torneos del campus
                            </span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex items-center gap-1.5 rounded-lg bg-foreground/[0.05] px-3 py-1.5 text-sm font-medium transition-colors hover:bg-foreground/10"
                                    >
                                        {abierto ? (
                                            <Globe className="size-4" />
                                        ) : (
                                            <Lock className="size-4" />
                                        )}
                                        {abierto ? 'Abierto' : 'Cerrado'}
                                        <ChevronDown className="size-3.5 text-muted-foreground" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-64"
                                >
                                    <DropdownMenuItem
                                        onSelect={() => setAbierto(true)}
                                    >
                                        <Globe />
                                        <div>
                                            <p className="font-medium">
                                                Abierto
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Acepta inscripciones y aparece
                                                en el listado.
                                            </p>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={() => setAbierto(false)}
                                    >
                                        <Lock />
                                        <div>
                                            <p className="font-medium">
                                                Cerrado
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Solo visible por enlace directo.
                                            </p>
                                        </div>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div>
                            <label htmlFor="nombre" className="sr-only">
                                Nombre del torneo
                            </label>
                            <textarea
                                id="nombre"
                                name="nombre"
                                rows={1}
                                value={nombre}
                                onChange={(event) =>
                                    setNombre(
                                        event.target.value.replace(/\n/g, ''),
                                    )
                                }
                                placeholder="Nombre del torneo"
                                aria-invalid={!!errors.nombre}
                                autoFocus={!editando}
                                className="field-sizing-content w-full resize-none bg-transparent text-4xl leading-tight font-semibold tracking-tight text-balance outline-none placeholder:text-foreground/25 sm:text-[2.75rem]"
                            />
                            <InputError message={errors.nombre} />
                        </div>

                        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px]">
                            <Bloque className="flex items-center gap-3 py-2 pr-2">
                                <span className="relative flex size-2.5 shrink-0 rounded-full bg-muted-foreground/60" />
                                <span className="text-muted-foreground">
                                    Fecha
                                </span>
                                <div className="ml-auto flex gap-1">
                                    <input
                                        type="date"
                                        aria-label="Día del torneo"
                                        value={dia}
                                        onChange={(event) =>
                                            setDia(event.target.value)
                                        }
                                        className="rounded-lg bg-foreground/[0.06] px-3 py-2 font-medium tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                                    />
                                    <input
                                        type="time"
                                        aria-label="Hora del torneo"
                                        value={hora}
                                        onChange={(event) =>
                                            setHora(event.target.value)
                                        }
                                        className="rounded-lg bg-foreground/[0.06] px-3 py-2 font-medium tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                                    />
                                </div>
                            </Bloque>
                            <Bloque className="flex flex-col justify-center gap-0.5 py-2.5 text-sm">
                                <Globe className="mb-1 size-4 text-muted-foreground" />
                                <span className="font-medium">{zona}</span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {nombreZona
                                        .split('/')
                                        .pop()
                                        ?.replace(/_/g, ' ')}
                                </span>
                            </Bloque>
                        </div>
                        <InputError message={errors.fecha} className="-mt-2" />

                        <div>
                            <Bloque className="flex items-start gap-3">
                                <Gamepad2 className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                    <label
                                        htmlFor="juego"
                                        className="font-medium"
                                    >
                                        Juego o deporte
                                    </label>
                                    <input
                                        id="juego"
                                        name="juego"
                                        list="juegos-sugeridos"
                                        value={juego}
                                        onChange={(event) =>
                                            setJuego(event.target.value)
                                        }
                                        placeholder="Fútbol, básquet, Valorant…"
                                        aria-invalid={!!errors.juego}
                                        className="block w-full bg-transparent text-sm text-muted-foreground outline-none placeholder:text-muted-foreground/70 focus:text-foreground [&::-webkit-calendar-picker-indicator]:hidden"
                                    />
                                    <datalist id="juegos-sugeridos">
                                        {juegosSugeridos.map((opcion) => (
                                            <option
                                                key={opcion}
                                                value={opcion}
                                            />
                                        ))}
                                    </datalist>
                                </div>
                            </Bloque>
                            <InputError
                                message={errors.juego}
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Bloque className="flex items-start gap-3">
                                <Text className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                                {conDescripcion ? (
                                    <textarea
                                        name="descripcion"
                                        defaultValue={torneo?.descripcion ?? ''}
                                        placeholder="Reglas, lugar, formato, premios…"
                                        autoFocus={!torneo?.descripcion}
                                        aria-label="Descripción"
                                        className="field-sizing-content min-h-20 w-full resize-none bg-transparent outline-none placeholder:text-muted-foreground/70"
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setConDescripcion(true)}
                                        className="flex-1 text-left font-medium"
                                    >
                                        Agregar descripción
                                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                                            (opcional)
                                        </span>
                                    </button>
                                )}
                            </Bloque>
                            <InputError
                                message={errors.descripcion}
                                className="mt-1.5"
                            />
                        </div>

                        <div className="mt-2 grid gap-2">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                Opciones del torneo
                            </h3>
                            <div className="divide-y divide-background/80 overflow-hidden rounded-xl bg-foreground/[0.05] dark:divide-background/40">
                                <Opcion
                                    icon={Users}
                                    etiqueta="Cupo de jugadores"
                                >
                                    <input
                                        id="cupo"
                                        name="cupo"
                                        type="number"
                                        inputMode="numeric"
                                        value={cupo}
                                        onChange={(event) =>
                                            setCupo(event.target.value)
                                        }
                                        aria-label="Cupo de jugadores"
                                        aria-invalid={!!errors.cupo}
                                        className="w-16 bg-transparent text-right text-muted-foreground tabular-nums outline-none focus:text-foreground [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <PencilLine className="size-4 text-muted-foreground" />
                                </Opcion>
                                <Opcion
                                    icon={abierto ? LockOpen : Lock}
                                    etiqueta="Inscripciones abiertas"
                                >
                                    <Switch
                                        checked={abierto}
                                        onCheckedChange={setAbierto}
                                        aria-label="Inscripciones abiertas"
                                    />
                                </Opcion>
                            </div>
                            <p className="px-1 text-xs text-muted-foreground">
                                Entre {minimoCupo} y 100 jugadores.
                                {editando &&
                                    torneo.inscritos > 0 &&
                                    ` Ya hay ${torneo.inscritos} inscritos.`}
                            </p>
                            <InputError message={errors.cupo} />
                            <InputError message={errors.estado} />
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            disabled={processing}
                            className="mt-4 h-12 w-full text-base"
                        >
                            {processing && <Spinner />}
                            {editando ? 'Guardar cambios' : 'Crear torneo'}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}

function Bloque({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <div
            className={cn(
                'rounded-xl bg-foreground/[0.05] px-4 py-3 transition-colors focus-within:bg-foreground/[0.08]',
                className,
            )}
        >
            {children}
        </div>
    );
}

function Opcion({
    icon: Icon,
    etiqueta,
    children,
}: {
    icon: typeof Users;
    etiqueta: string;
    children: ReactNode;
}) {
    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <Icon className="size-5 text-muted-foreground" />
            <span className="flex-1 font-medium">{etiqueta}</span>
            <div className="flex items-center gap-2">{children}</div>
        </div>
    );
}

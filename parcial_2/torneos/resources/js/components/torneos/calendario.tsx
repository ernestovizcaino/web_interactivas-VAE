import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { claveDia } from '@/lib/format';
import { cn } from '@/lib/utils';

const diasSemana = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const nombreMes = new Intl.DateTimeFormat('es-MX', { month: 'long' });

type Props = {
    fechasConTorneo: Set<string>;
    seleccionado: string | null;
    onSeleccionar: (clave: string | null) => void;
    mesInicial?: Date;
};

export function Calendario({
    fechasConTorneo,
    seleccionado,
    onSeleccionar,
    mesInicial,
}: Props) {
    const hoy = new Date();
    const [mes, setMes] = useState(
        () =>
            new Date(
                (mesInicial ?? hoy).getFullYear(),
                (mesInicial ?? hoy).getMonth(),
                1,
            ),
    );

    const inicio = new Date(mes);
    inicio.setDate(1 - mes.getDay());

    const semanas = Math.ceil((mes.getDay() + diasEnMes(mes)) / 7);
    const dias = Array.from({ length: semanas * 7 }, (_, indice) => {
        const dia = new Date(inicio);
        dia.setDate(inicio.getDate() + indice);

        return dia;
    });

    const cambiarMes = (delta: number) =>
        setMes(new Date(mes.getFullYear(), mes.getMonth() + delta, 1));

    const esMesActual =
        mes.getFullYear() === hoy.getFullYear() &&
        mes.getMonth() === hoy.getMonth();

    return (
        <div className="rounded-2xl border bg-background p-4 shadow-xs">
            <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="text-lg font-semibold">
                    {nombreMes.format(mes)}
                    {mes.getFullYear() !== hoy.getFullYear() && (
                        <span className="ml-1.5 font-normal text-muted-foreground">
                            {mes.getFullYear()}
                        </span>
                    )}
                </h3>
                <div className="flex items-center gap-0.5 text-muted-foreground">
                    <BotonNavegacion
                        etiqueta="Mes anterior"
                        onClick={() => cambiarMes(-1)}
                    >
                        <ChevronLeft className="size-4" />
                    </BotonNavegacion>
                    <BotonNavegacion
                        etiqueta="Ir al mes actual"
                        onClick={() =>
                            setMes(
                                new Date(hoy.getFullYear(), hoy.getMonth(), 1),
                            )
                        }
                    >
                        <span
                            className={cn(
                                'size-1.5 rounded-full bg-current',
                                esMesActual && 'opacity-40',
                            )}
                        />
                    </BotonNavegacion>
                    <BotonNavegacion
                        etiqueta="Mes siguiente"
                        onClick={() => cambiarMes(1)}
                    >
                        <ChevronRight className="size-4" />
                    </BotonNavegacion>
                </div>
            </div>

            <div className="grid grid-cols-7 text-center text-sm">
                {diasSemana.map((dia, indice) => (
                    <span
                        key={dia}
                        className={cn(
                            'pb-2 text-xs font-medium',
                            indice === 0 || indice === 6
                                ? 'text-muted-foreground/70'
                                : 'text-foreground/80',
                        )}
                    >
                        {dia}
                    </span>
                ))}
                {dias.map((dia) => {
                    const clave = claveDia(dia);
                    const fueraDeMes = dia.getMonth() !== mes.getMonth();
                    const conTorneo = fechasConTorneo.has(clave);
                    const esHoy = clave === claveDia(hoy);
                    const activo = seleccionado === clave;

                    return (
                        <button
                            key={clave}
                            type="button"
                            disabled={!conTorneo}
                            onClick={() => onSeleccionar(activo ? null : clave)}
                            aria-pressed={activo}
                            aria-label={dia.toLocaleDateString('es-MX', {
                                day: 'numeric',
                                month: 'long',
                            })}
                            className={cn(
                                'relative mx-auto flex size-9 flex-col items-center justify-center rounded-full tabular-nums transition-colors',
                                fueraDeMes
                                    ? 'text-muted-foreground/40'
                                    : 'text-muted-foreground',
                                conTorneo &&
                                    'font-semibold text-foreground hover:bg-muted',
                                esHoy && 'text-lime-600 dark:text-primary',
                                activo &&
                                    'bg-primary text-primary-foreground hover:bg-primary',
                            )}
                        >
                            {dia.getDate()}
                            {conTorneo && (
                                <span
                                    className={cn(
                                        'absolute bottom-1 size-1 rounded-full',
                                        activo
                                            ? 'bg-primary-foreground'
                                            : 'bg-muted-foreground/60',
                                    )}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function diasEnMes(fecha: Date): number {
    return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
}

function BotonNavegacion({
    etiqueta,
    onClick,
    children,
}: {
    etiqueta: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={etiqueta}
            className="flex size-7 items-center justify-center rounded-full transition-colors hover:bg-muted hover:text-foreground"
        >
            {children}
        </button>
    );
}

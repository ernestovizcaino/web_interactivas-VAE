import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarCheck,
    Eye,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Trash2,
    Trophy,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { ConfirmarAccion } from '@/components/torneos/confirmar-accion';
import { EstadoBadge } from '@/components/torneos/estado-badge';
import { Plazas } from '@/components/torneos/plazas';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatFechaCorta, formatHora } from '@/lib/format';
import { create, destroy, edit, index, show } from '@/routes/admin/torneos';
import type { Torneo } from '@/types';

type Props = {
    torneos: Torneo[];
    filtros: { buscar: string };
    estadisticas: {
        torneos: number;
        disponibles: number;
        inscripciones: number;
    };
};

export default function AdminTorneos({
    torneos,
    filtros,
    estadisticas,
}: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar);

    const enviar = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            index.url({ query: { buscar: buscar || undefined } }),
            {},
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Administración de torneos" />

            <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                    <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                        Administración
                    </h1>
                    <p className="text-muted-foreground">
                        Crea, edita y elimina torneos; gestiona sus inscritos.
                    </p>
                </div>
                <Button asChild size="lg">
                    <Link href={create()}>
                        <Plus />
                        Nuevo torneo
                    </Link>
                </Button>
            </section>

            <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <Estadistica
                    icon={Trophy}
                    label="Torneos totales"
                    valor={estadisticas.torneos}
                />
                <Estadistica
                    icon={CalendarCheck}
                    label="Disponibles al público"
                    valor={estadisticas.disponibles}
                />
                <Estadistica
                    icon={Users}
                    label="Inscripciones"
                    valor={estadisticas.inscripciones}
                />
            </div>

            <Card className="gap-0 py-0">
                <div className="border-b p-4">
                    <form onSubmit={enviar} role="search" className="max-w-sm">
                        <InputGroup>
                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                            <InputGroupInput
                                value={buscar}
                                onChange={(event) =>
                                    setBuscar(event.target.value)
                                }
                                placeholder="Buscar torneo o juego…"
                                aria-label="Buscar torneos"
                            />
                        </InputGroup>
                    </form>
                </div>

                {torneos.length === 0 ? (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Trophy />
                            </EmptyMedia>
                            <EmptyTitle>
                                {filtros.buscar
                                    ? 'Sin resultados'
                                    : 'Todavía no hay torneos'}
                            </EmptyTitle>
                            <EmptyDescription>
                                {filtros.buscar
                                    ? `Ningún torneo coincide con «${filtros.buscar}».`
                                    : 'Crea el primero para que los jugadores puedan inscribirse.'}
                            </EmptyDescription>
                        </EmptyHeader>
                        {!filtros.buscar && (
                            <EmptyContent>
                                <Button asChild>
                                    <Link href={create()}>
                                        <Plus />
                                        Nuevo torneo
                                    </Link>
                                </Button>
                            </EmptyContent>
                        )}
                    </Empty>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-4">Torneo</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead className="w-48">Plazas</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="w-12 pr-4">
                                    <span className="sr-only">Acciones</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {torneos.map((torneo) => (
                                <TableRow key={torneo.id}>
                                    <TableCell className="pl-4">
                                        <Link
                                            href={show(torneo.id)}
                                            className="font-medium hover:underline"
                                        >
                                            {torneo.nombre}
                                        </Link>
                                        <p className="text-xs text-muted-foreground">
                                            {torneo.juego}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <p>{formatFechaCorta(torneo.fecha)}</p>
                                        <p className="text-xs text-muted-foreground tabular-nums">
                                            {formatHora(torneo.fecha)}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <Plazas torneo={torneo} compact />
                                    </TableCell>
                                    <TableCell>
                                        <EstadoBadge
                                            estado={torneo.estado_visible}
                                        />
                                    </TableCell>
                                    <TableCell className="pr-4">
                                        <Acciones torneo={torneo} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </>
    );
}

function Acciones({ torneo }: { torneo: Torneo }) {
    return (
        <div className="flex justify-end">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Acciones de ${torneo.nombre}`}
                    >
                        <MoreHorizontal />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                        <Link href={show(torneo.id)}>
                            <Eye />
                            Ver inscritos
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={edit(torneo.id)}>
                            <Pencil />
                            Editar
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <ConfirmarAccion
                trigger={
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Eliminar ${torneo.nombre}`}
                    >
                        <Trash2 />
                    </Button>
                }
                title="¿Eliminar este torneo?"
                description={
                    torneo.inscritos > 0
                        ? `Se eliminará «${torneo.nombre}» junto con sus ${torneo.inscritos} inscripciones. Esta acción no se puede deshacer.`
                        : `Se eliminará «${torneo.nombre}». Esta acción no se puede deshacer.`
                }
                confirmLabel="Eliminar torneo"
                action={destroy(torneo.id)}
            />
        </div>
    );
}

function Estadistica({
    icon: Icon,
    label,
    valor,
}: {
    icon: typeof Trophy;
    label: string;
    valor: number;
}) {
    return (
        <Card className="py-0">
            <CardContent className="flex items-center gap-4 p-5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-lime-700 dark:text-primary">
                    <Icon className="size-5" />
                </span>
                <div>
                    <p className="text-2xl font-semibold tabular-nums">
                        {valor}
                    </p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}

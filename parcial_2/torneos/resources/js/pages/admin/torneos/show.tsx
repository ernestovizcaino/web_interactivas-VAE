import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ExternalLink,
    Pencil,
    UserMinus,
    Users,
} from 'lucide-react';
import { ConfirmarAccion } from '@/components/torneos/confirmar-accion';
import { EstadoBadge } from '@/components/torneos/estado-badge';
import { Plazas } from '@/components/torneos/plazas';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useInitials } from '@/hooks/use-initials';
import { formatFechaCorta, formatFechaLarga, formatHora } from '@/lib/format';
import { destroy as darDeBaja } from '@/routes/admin/inscripciones';
import { edit, index } from '@/routes/admin/torneos';
import { show as verPublico } from '@/routes/torneos';
import type { InscripcionAdmin, Torneo } from '@/types';

type Props = {
    torneo: Torneo;
    inscripciones: InscripcionAdmin[];
};

export default function AdminTorneoShow({ torneo, inscripciones }: Props) {
    const getInitials = useInitials();

    return (
        <>
            <Head title={`Inscritos · ${torneo.nombre}`} />

            <Button variant="ghost" size="sm" asChild className="mb-4 -ml-3">
                <Link href={index()}>
                    <ArrowLeft />
                    Administración
                </Link>
            </Button>

            <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                    <EstadoBadge estado={torneo.estado_visible} />
                    <h1 className="font-heading text-3xl font-semibold tracking-tight">
                        {torneo.nombre}
                    </h1>
                    <p className="text-muted-foreground">
                        {torneo.juego} ·{' '}
                        <span>{formatFechaLarga(torneo.fecha)}</span>,{' '}
                        {formatHora(torneo.fecha)}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={verPublico(torneo.id)}>
                            <ExternalLink />
                            Vista pública
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={edit(torneo.id)}>
                            <Pencil />
                            Editar
                        </Link>
                    </Button>
                </div>
            </section>

            <Card>
                <CardHeader className="sm:flex sm:items-end sm:justify-between">
                    <div className="space-y-1.5">
                        <CardTitle>Jugadores inscritos</CardTitle>
                        <CardDescription>
                            Puedes dar de baja cualquier inscripción; la plaza
                            quedará libre.
                        </CardDescription>
                    </div>
                    <Plazas torneo={torneo} className="mt-4 sm:mt-0 sm:w-64" />
                </CardHeader>
                <CardContent>
                    {inscripciones.length === 0 ? (
                        <Empty className="border">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <Users />
                                </EmptyMedia>
                                <EmptyTitle>Sin inscritos</EmptyTitle>
                                <EmptyDescription>
                                    Ningún jugador se ha inscrito todavía.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10">#</TableHead>
                                    <TableHead>Jugador</TableHead>
                                    <TableHead className="hidden sm:table-cell">
                                        Inscrito el
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Acción
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inscripciones.map((inscripcion, posicion) => (
                                    <TableRow key={inscripcion.id}>
                                        <TableCell className="text-muted-foreground tabular-nums">
                                            {posicion + 1}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-8">
                                                    <AvatarFallback className="bg-primary/20 text-xs font-semibold">
                                                        {getInitials(
                                                            inscripcion.nombre,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium">
                                                        {inscripcion.nombre}
                                                    </p>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {inscripcion.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden text-muted-foreground sm:table-cell">
                                            {inscripcion.fecha &&
                                                formatFechaCorta(
                                                    inscripcion.fecha,
                                                )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <ConfirmarAccion
                                                trigger={
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    >
                                                        <UserMinus />
                                                        Dar de baja
                                                    </Button>
                                                }
                                                title={`¿Dar de baja a ${inscripcion.nombre}?`}
                                                description={`Se eliminará su inscripción en «${torneo.nombre}» y su plaza quedará libre.`}
                                                confirmLabel="Dar de baja"
                                                action={darDeBaja({
                                                    torneo: torneo.id,
                                                    inscripcion: inscripcion.id,
                                                })}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </>
    );
}

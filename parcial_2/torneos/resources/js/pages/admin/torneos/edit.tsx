import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { EstadoBadge } from '@/components/torneos/estado-badge';
import { TorneoForm } from '@/components/torneos/torneo-form';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/admin/torneos';
import type { Torneo } from '@/types';

export default function EditTorneo({ torneo }: { torneo: Torneo }) {
    return (
        <>
            <Head title={`Editar ${torneo.nombre}`} />
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <Button variant="ghost" size="sm" asChild className="-ml-3">
                        <Link href={index()}>
                            <ArrowLeft />
                            Administración
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <EstadoBadge estado={torneo.estado_visible} />
                        {torneo.inscritos} de {torneo.cupo} plazas ocupadas
                    </div>
                </div>
                <TorneoForm torneo={torneo} />
            </div>
        </>
    );
}

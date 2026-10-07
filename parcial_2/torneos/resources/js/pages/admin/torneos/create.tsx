import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { TorneoForm } from '@/components/torneos/torneo-form';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/admin/torneos';

export default function CreateTorneo() {
    return (
        <>
            <Head title="Nuevo torneo" />
            <div className="mx-auto max-w-5xl">
                <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="mb-6 -ml-3"
                >
                    <Link href={index()}>
                        <ArrowLeft />
                        Administración
                    </Link>
                </Button>
                <TorneoForm />
            </div>
        </>
    );
}

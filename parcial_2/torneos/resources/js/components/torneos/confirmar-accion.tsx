import { router } from '@inertiajs/react';
import type { RouteDefinition } from '@/wayfinder';
import { useState } from 'react';
import type { ReactNode } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    trigger: ReactNode;
    title: string;
    description: ReactNode;
    confirmLabel: string;
    action: RouteDefinition<'delete' | 'post'>;
    destructive?: boolean;
};

/**
 * Diálogo de confirmación que ejecuta una petición de Inertia al aceptar.
 */
export function ConfirmarAccion({
    trigger,
    title,
    description,
    confirmLabel,
    action,
    destructive = true,
}: Props) {
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const confirmar = () => {
        router.visit(action, {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setOpen(false);
            },
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={processing}>
                        Volver
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant={destructive ? 'destructive' : 'default'}
                        disabled={processing}
                        onClick={(event) => {
                            event.preventDefault();
                            confirmar();
                        }}
                    >
                        {processing && <Spinner />}
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

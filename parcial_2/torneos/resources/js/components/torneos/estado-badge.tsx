import { CalendarX2, CircleCheck, Lock, UserCheck, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EstadoVisible } from '@/types';

const estados: Record<
    EstadoVisible,
    { label: string; icon: typeof CircleCheck; className: string }
> = {
    abierto: {
        label: 'Abierto',
        icon: CircleCheck,
        className:
            'bg-primary/15 text-lime-800 dark:bg-primary/15 dark:text-primary',
    },
    lleno: {
        label: 'Lleno',
        icon: Users,
        className:
            'bg-amber-500/15 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    },
    cerrado: {
        label: 'Cerrado',
        icon: Lock,
        className: 'bg-destructive/10 text-destructive',
    },
    finalizado: {
        label: 'Finalizado',
        icon: CalendarX2,
        className: 'bg-muted text-muted-foreground',
    },
};

export function EstadoBadge({
    estado,
    className,
}: {
    estado: EstadoVisible;
    className?: string;
}) {
    const { label, icon: Icon, className: estilos } = estados[estado];

    return (
        <Badge variant="secondary" className={cn(estilos, className)}>
            <Icon data-icon="inline-start" />
            {label}
        </Badge>
    );
}

export function InscritoBadge({ className }: { className?: string }) {
    return (
        <Badge
            variant="secondary"
            className={cn(
                'bg-sky-500/15 text-sky-700 dark:text-sky-400',
                className,
            )}
        >
            <UserCheck data-icon="inline-start" />
            Inscrito
        </Badge>
    );
}

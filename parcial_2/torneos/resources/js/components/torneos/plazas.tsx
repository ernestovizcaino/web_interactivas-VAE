import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Torneo } from '@/types';

export function Plazas({
    torneo,
    className,
    compact = false,
}: {
    torneo: Pick<Torneo, 'inscritos' | 'cupo' | 'plazas_libres'>;
    className?: string;
    compact?: boolean;
}) {
    const porcentaje = Math.min(100, (torneo.inscritos / torneo.cupo) * 100);
    const libres = torneo.plazas_libres;

    return (
        <div className={cn('grid gap-1.5', className)}>
            <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium tabular-nums">
                    {torneo.inscritos}
                    <span className="text-muted-foreground">
                        /{torneo.cupo}
                    </span>
                    {!compact && (
                        <span className="ml-1 font-normal text-muted-foreground">
                            inscritos
                        </span>
                    )}
                </span>
                <span
                    className={cn(
                        'text-xs tabular-nums',
                        libres === 0
                            ? 'font-medium text-amber-600 dark:text-amber-400'
                            : libres <= 3
                              ? 'font-medium text-orange-600 dark:text-orange-400'
                              : 'text-muted-foreground',
                    )}
                >
                    {libres === 0
                        ? 'Sin plazas'
                        : libres === 1
                          ? '¡Última plaza!'
                          : `${libres} plazas libres`}
                </span>
            </div>
            <Progress value={porcentaje} className="h-1.5" />
        </div>
    );
}

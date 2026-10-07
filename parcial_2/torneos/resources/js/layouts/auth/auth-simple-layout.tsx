import { Link, usePage } from '@inertiajs/react';
import { KeyRound, Lock, LogIn, Trophy, UserPlus } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { home } from '@/routes';
import { index as torneos } from '@/routes/torneos';
import type { AuthLayoutProps } from '@/types';

const iconos: Record<string, typeof Trophy> = {
    'auth/login': LogIn,
    'auth/register': UserPlus,
    'auth/forgot-password': KeyRound,
    'auth/reset-password': KeyRound,
    'auth/confirm-password': Lock,
};

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { component } = usePage();
    const Icono = iconos[component] ?? Trophy;

    return (
        <div className="relative flex min-h-svh flex-col overflow-hidden bg-[#f7f6f5] dark:bg-background">
            <FondoDegradado />

            <header className="relative z-10 flex h-14 items-center gap-6 px-4 sm:px-5">
                <Link
                    href={home()}
                    className="rounded-lg transition-opacity hover:opacity-80"
                >
                    <AppLogo />
                </Link>
                <div className="ml-auto flex items-center gap-4 text-sm">
                    <Link
                        href={torneos()}
                        className="text-foreground/80 transition-colors hover:text-foreground"
                    >
                        Descubrir torneos
                    </Link>
                </div>
            </header>

            <main className="relative z-10 flex flex-1 items-center justify-center p-4 pb-20 sm:p-6 sm:pb-24">
                <div className="w-full max-w-[400px] rounded-3xl border border-white/80 bg-white/75 p-7 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-card/80">
                    <div className="mb-6 space-y-2">
                        <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-foreground/[0.06] text-muted-foreground">
                            <Icono className="size-6" strokeWidth={1.75} />
                        </span>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                    {children}
                </div>
            </main>
        </div>
    );
}

/**
 * Manchas de color difuminadas que dan el degradado suave del fondo.
 */
function FondoDegradado() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
        >
            <div className="absolute -bottom-[20%] -left-[10%] h-[70%] w-[60%] rounded-full bg-rose-200/50 blur-[120px] dark:bg-rose-900/20" />
            <div className="absolute top-[35%] left-[35%] h-[55%] w-[45%] rounded-full bg-orange-200/45 blur-[120px] dark:bg-orange-900/15" />
            <div className="absolute top-[5%] -right-[10%] h-[60%] w-[45%] rounded-full bg-sky-200/45 blur-[120px] dark:bg-sky-900/15" />
            <div className="absolute -top-[15%] left-[10%] h-[40%] w-[40%] rounded-full bg-lime-100/60 blur-[120px] dark:bg-lime-900/10" />
        </div>
    );
}

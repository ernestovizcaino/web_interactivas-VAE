import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, ListChecks, Menu, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import AppLogo from '@/components/app-logo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { login, misTorneos, register } from '@/routes';
import { index as adminTorneos } from '@/routes/admin/torneos';
import { index as torneos } from '@/routes/torneos';
import type { NavItem } from '@/types';

export default function SiteLayout({ children }: { children: ReactNode }) {
    const { auth } = usePage().props;
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const getInitials = useInitials();
    const [conScroll, setConScroll] = useState(false);

    useEffect(() => {
        const actualizar = () => setConScroll(window.scrollY > 8);
        actualizar();
        window.addEventListener('scroll', actualizar, { passive: true });

        return () => window.removeEventListener('scroll', actualizar);
    }, []);
    const user = auth.user;

    const navItems: NavItem[] = [
        { title: 'Descubrir torneos', href: torneos(), icon: Trophy },
        ...(user && !auth.isAdmin
            ? [{ title: 'Mis torneos', href: misTorneos(), icon: ListChecks }]
            : []),
        ...(auth.isAdmin
            ? [
                  {
                      title: 'Administración',
                      href: adminTorneos(),
                      icon: LayoutDashboard,
                  },
              ]
            : []),
    ];

    return (
        <div className="relative flex min-h-svh flex-col overflow-x-clip bg-[#f6f6f7] dark:bg-background">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-linear-to-b from-lime-100/70 via-sky-50/60 to-transparent dark:from-lime-950/30 dark:via-transparent"
            />
            <header
                className={cn(
                    'sticky top-0 z-40 border-b border-transparent transition-[background-color,border-color,backdrop-filter] duration-300',
                    conScroll &&
                        'border-border/60 bg-[#f6f6f7]/85 backdrop-blur-xl dark:bg-background/85',
                )}
            >
                <div className="flex h-14 w-full items-center gap-6 px-4 sm:px-5">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="-ml-2 md:hidden"
                                aria-label="Abrir menú"
                            >
                                <Menu />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72">
                            <SheetHeader>
                                <SheetTitle>
                                    <AppLogo />
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="grid gap-1 px-4">
                                {navItems.map((item) => (
                                    <Button
                                        key={item.title}
                                        variant="ghost"
                                        asChild
                                        className={cn(
                                            'justify-start',
                                            isCurrentOrParentUrl(item.href) &&
                                                'bg-muted',
                                        )}
                                    >
                                        <Link href={item.href}>
                                            {item.icon && <item.icon />}
                                            {item.title}
                                        </Link>
                                    </Button>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>

                    <Link
                        href={torneos()}
                        prefetch
                        className="rounded-lg transition-opacity hover:opacity-80"
                    >
                        <AppLogo />
                    </Link>

                    <div className="ml-auto flex items-center gap-1 sm:gap-2">
                        <nav className="hidden items-center md:flex">
                            {navItems.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    prefetch
                                    className={cn(
                                        'rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground',
                                        isCurrentOrParentUrl(item.href) &&
                                            'text-foreground',
                                    )}
                                >
                                    {item.title}
                                </Link>
                            ))}
                        </nav>
                        {user ? (
                            <>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-full"
                                            aria-label="Menú de usuario"
                                        >
                                            <Avatar className="size-8">
                                                <AvatarFallback className="bg-primary/20 text-xs font-semibold">
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-56"
                                        align="end"
                                    >
                                        <UserMenuContent user={user} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="hidden text-muted-foreground sm:inline-flex"
                                >
                                    <Link href={register()}>Registrarse</Link>
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    asChild
                                    className="bg-foreground/[0.06] hover:bg-foreground/10"
                                >
                                    <Link href={login()}>Iniciar sesión</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="relative mx-auto w-full max-w-6xl flex-1 px-4 pt-4 pb-16 sm:px-6">
                {children}
            </main>
        </div>
    );
}

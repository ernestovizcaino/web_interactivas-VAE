import { BookOpen, Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
    DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function RecipeActions({ title, showUrl, editUrl, deleteUrl }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-lg" aria-label={`Acciones de ${title}`}>
                    <Ellipsis aria-hidden="true" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild className="min-h-10">
                        <a href={showUrl}><BookOpen aria-hidden="true" /> Ver receta</a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="min-h-10">
                        <a href={editUrl}><Pencil aria-hidden="true" /> Editar</a>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem variant="destructive" asChild className="min-h-10">
                        <a href={deleteUrl}><Trash2 aria-hidden="true" /> Eliminar</a>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

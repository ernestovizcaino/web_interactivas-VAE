import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { cn } from '@/lib/utils';

export function FormControl({ kind, options, ...props }) {
    return (
        <FieldGroup>
            <Field data-invalid={props['aria-invalid'] === 'true'}>
                {kind === 'select' ? (
                    <NativeSelect {...props} className="w-full">
                        {options.map((option) => (
                            <NativeSelectOption key={option.value} value={option.value}>{option.label}</NativeSelectOption>
                        ))}
                    </NativeSelect>
                ) : kind === 'textarea' ? (
                    <Textarea {...props} className="min-h-40 resize-y" />
                ) : (
                    <Input {...props} className="h-11" />
                )}
            </Field>
        </FieldGroup>
    );
}

export function ActionButton({ label, icon: Icon, href, form, className, ...props }) {
    const [pending, setPending] = useState(false);

    useEffect(() => {
        if (!form) return;
        const handleSubmit = () => setPending(true);
        const handlePageShow = (event) => {
            if (event.persisted) setPending(false);
        };
        form.addEventListener('submit', handleSubmit);
        window.addEventListener('pageshow', handlePageShow);
        return () => {
            form.removeEventListener('submit', handleSubmit);
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, [form]);

    const content = <>{Icon && <Icon data-icon="inline-start" aria-hidden="true" />}{pending ? 'Guardando…' : label}</>;
    const classes = cn(className);
    if (href) {
        return <Button {...props} asChild className={classes}><a href={href}>{content}</a></Button>;
    }
    return <Button {...props} className={classes} disabled={pending} aria-busy={pending || undefined}>{content}</Button>;
}

export function RecipeBadge({ label, variant }) {
    return <Badge variant={variant}>{label}</Badge>;
}

export function Feedback({ message, variant, icon: Icon, role }) {
    return (
        <Alert variant={variant} role={role} className="mb-7">
            {Icon && <Icon aria-hidden="true" />}
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}

export function EmptyRecipes({ title, description, icon: Icon, href, label }) {
    return (
        <Empty className="border py-16">
            <EmptyHeader>
                <EmptyMedia variant="icon"><Icon aria-hidden="true" /></EmptyMedia>
                <EmptyTitle><h3>{title}</h3></EmptyTitle>
                <EmptyDescription>{description}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent><Button variant="outline" size="lg" asChild><a href={href}>{label}</a></Button></EmptyContent>
        </Empty>
    );
}

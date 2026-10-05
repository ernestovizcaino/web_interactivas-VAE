import React from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, BookOpen, Check, ChevronRight, CircleAlert, Clock, Leaf, Lock, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { ActionButton, EmptyRecipes, Feedback, FormControl, RecipeBadge } from '@/components/blade-controls';
import { RecipeActions } from '@/components/recipe-actions';

// Blade supplies the form, CSRF token, validation, and a usable HTML fallback.
// React replaces only the presentation controls, retaining native form submission.
const icons = { arrow: ArrowLeft, book: BookOpen, check: Check, chevron: ChevronRight, clock: Clock, leaf: Leaf, lock: Lock, edit: Pencil, plus: Plus, search: Search, trash: Trash2 };

function mount(element, component) {
    const container = document.createElement('span');
    container.style.display = 'contents';
    element.replaceWith(container);
    createRoot(container).render(component);
}

function attributes(element) {
    const props = {};
    const names = {
        id: 'id', name: 'name', type: 'type', placeholder: 'placeholder',
        maxlength: 'maxLength', min: 'min', max: 'max', step: 'step',
        autocomplete: 'autoComplete', rows: 'rows', title: 'title',
        'aria-label': 'aria-label', 'aria-invalid': 'aria-invalid',
        'aria-describedby': 'aria-describedby',
    };
    for (const [attribute, prop] of Object.entries(names)) {
        if (element.hasAttribute(attribute)) props[prop] = element.getAttribute(attribute);
    }
    if (element.required) props.required = true;
    return props;
}

document.querySelectorAll('[data-ui-recipe-actions]').forEach((element) => {
    mount(element, <RecipeActions
        title={element.dataset.recipeTitle}
        showUrl={element.querySelector('[data-action="show"]').href}
        editUrl={element.querySelector('[data-action="edit"]').href}
        deleteUrl={element.querySelector('[data-action="delete"]').href}
    />);
});

document.querySelectorAll('[data-ui-empty]').forEach((element) => {
    const action = element.querySelector('a');
    const Icon = icons[element.querySelector('svg').dataset.uiIcon] || BookOpen;
    mount(element, <EmptyRecipes title={element.querySelector('h3').textContent}
        description={element.querySelector('p').textContent} icon={Icon}
        href={action.href} label={action.textContent.trim()} />);
});

document.querySelectorAll('[data-ui-alert]').forEach((element) => {
    mount(element, <Feedback message={element.textContent.trim()}
        variant={element.dataset.uiVariant || 'default'}
        icon={element.dataset.uiVariant === 'destructive' ? CircleAlert : Check}
        role={element.getAttribute('role') || 'alert'} />);
});

document.querySelectorAll('[data-ui-badge]').forEach((element) => {
    const label = element.textContent.trim();
    mount(element, <RecipeBadge label={label.charAt(0).toLocaleUpperCase('es') + label.slice(1)}
        variant={element.dataset.uiVariant || 'secondary'} />);
});

document.querySelectorAll('input.field, textarea.field, select.field').forEach((element) => {
    const kind = element.tagName.toLowerCase();
    const options = kind === 'select'
        ? Array.from(element.options, (option) => ({ value: option.value, label: option.textContent }))
        : undefined;
    mount(element, <FormControl {...attributes(element)} kind={kind}
        defaultValue={element.value} options={options} />);
});

document.querySelectorAll('a.btn-primary, a.btn-secondary, button.btn-primary, button.btn-secondary').forEach((element) => {
    const Icon = icons[element.querySelector('svg')?.dataset.uiIcon];
    const layout = Array.from(element.classList).filter((name) => /^(w-full|mt-\d+)$/.test(name)).join(' ');
    mount(element, <ActionButton {...attributes(element)}
        label={element.textContent.trim()} icon={Icon}
        href={element.tagName === 'A' ? element.href : undefined}
        type={element.tagName === 'BUTTON' ? element.getAttribute('type') || 'button' : undefined}
        form={element.tagName === 'BUTTON' && element.type === 'submit' ? element.closest('form[data-submit-once]') : null}
        variant={element.dataset.uiVariant || (element.classList.contains('btn-primary') ? 'default' : 'outline')}
        size={element.dataset.uiSize || 'lg'} className={layout} />);
});

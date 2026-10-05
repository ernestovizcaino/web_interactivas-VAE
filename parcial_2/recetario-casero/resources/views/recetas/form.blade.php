@if($errors->any())
    <p data-ui-alert data-ui-variant="destructive" class="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">Revisa los campos señalados antes de guardar. Tus datos se conservaron.</p>
@endif
<div class="grid items-start gap-7 lg:grid-cols-[1fr_280px]">
    <div class="flex flex-col gap-7">
        <section class="form-card" aria-labelledby="datos-titulo">
            <h2 id="datos-titulo" class="form-card-title">Lo esencial</h2>
            <div>
                <label for="titulo" class="field-label">Título <span class="text-brand">*</span></label>
                <input id="titulo" name="titulo" class="field" value="{{ old('titulo', $receta->titulo) }}" maxlength="150" placeholder="Ej. Enchiladas verdes de la abuela" required aria-invalid="{{ $errors->has('titulo') ? 'true' : 'false' }}" @if($errors->has('titulo')) aria-describedby="titulo-error" @endif>
                <x-field-error name="titulo"/>
            </div>
            <div class="mt-5 grid gap-5 sm:grid-cols-3">
                <div>
                    <label for="categoria" class="field-label">Categoría <span class="text-brand">*</span></label>
                    <select id="categoria" name="categoria" class="field" required aria-invalid="{{ $errors->has('categoria') ? 'true' : 'false' }}" @if($errors->has('categoria')) aria-describedby="categoria-error" @endif>
                        <option value="">Selecciona</option>
                        @foreach($categorias as $opcion)
                            <option value="{{ $opcion }}" @selected(old('categoria', $receta->categoria) === $opcion)>{{ ucfirst($opcion) }}</option>
                        @endforeach
                    </select>
                    <x-field-error name="categoria"/>
                </div>
                <div>
                    <label for="tiempo_minutos" class="field-label">Tiempo (min) <span class="text-brand">*</span></label>
                    <input id="tiempo_minutos" name="tiempo_minutos" type="number" class="field" min="1" max="4294967295" step="1" value="{{ old('tiempo_minutos', $receta->tiempo_minutos) }}" placeholder="30" required aria-invalid="{{ $errors->has('tiempo_minutos') ? 'true' : 'false' }}" @if($errors->has('tiempo_minutos')) aria-describedby="tiempo_minutos-error" @endif>
                    <x-field-error name="tiempo_minutos"/>
                </div>
                <div>
                    <label for="dificultad" class="field-label">Dificultad <span class="text-brand">*</span></label>
                    <select id="dificultad" name="dificultad" class="field" required aria-invalid="{{ $errors->has('dificultad') ? 'true' : 'false' }}" @if($errors->has('dificultad')) aria-describedby="dificultad-error" @endif>
                        <option value="">Selecciona</option>
                        @foreach($dificultades as $opcion)
                            <option value="{{ $opcion }}" @selected(old('dificultad', $receta->dificultad) === $opcion)>{{ ucfirst($opcion) }}</option>
                        @endforeach
                    </select>
                    <x-field-error name="dificultad"/>
                </div>
            </div>
        </section>
        <section class="form-card" aria-labelledby="preparacion-titulo">
            <h2 id="preparacion-titulo" class="form-card-title">Ingredientes y pasos</h2>
            <div>
                <label for="ingredientes" class="field-label">Ingredientes <span class="text-brand">*</span></label>
                <p id="ingredientes-help" class="mb-3 text-xs text-muted-foreground">Uno por línea, con su cantidad.</p>
                <textarea id="ingredientes" name="ingredientes" rows="6" class="field resize-y leading-7" maxlength="20000" placeholder="2 tazas de harina&#10;1 huevo&#10;Una pizca de sal" required aria-invalid="{{ $errors->has('ingredientes') ? 'true' : 'false' }}" aria-describedby="ingredientes-help{{ $errors->has('ingredientes') ? ' ingredientes-error' : '' }}">{{ old('ingredientes', $receta->ingredientes) }}</textarea>
                <x-field-error name="ingredientes"/>
            </div>
            <div class="mt-6">
                <label for="pasos" class="field-label">Pasos de preparación <span class="text-brand">*</span></label>
                <p id="pasos-help" class="mb-3 text-xs text-muted-foreground">Uno por línea. Se numeran solos.</p>
                <textarea id="pasos" name="pasos" rows="7" class="field resize-y leading-7" maxlength="20000" placeholder="Mezcla los ingredientes secos.&#10;Agrega el huevo y bate.&#10;Cocina a fuego medio." required aria-invalid="{{ $errors->has('pasos') ? 'true' : 'false' }}" aria-describedby="pasos-help{{ $errors->has('pasos') ? ' pasos-error' : '' }}">{{ old('pasos', $receta->pasos) }}</textarea>
                <x-field-error name="pasos"/>
            </div>
        </section>
    </div>
    <aside class="flex flex-col gap-6">
        <section class="rounded-2xl bg-accent p-6">
            <label for="nota_personal" class="form-card-title mb-1 block">Nota personal</label>
            <p class="mb-4 text-xs text-muted-foreground">Opcional.</p>
            <textarea id="nota_personal" name="nota_personal" rows="6" class="field resize-y leading-7" maxlength="5000" placeholder="Mi secreto es…" aria-invalid="{{ $errors->has('nota_personal') ? 'true' : 'false' }}" @if($errors->has('nota_personal')) aria-describedby="nota_personal-error" @endif>{{ old('nota_personal', $receta->nota_personal) }}</textarea>
            <x-field-error name="nota_personal"/>
        </section>
    </aside>
</div>
<div class="mt-8 flex flex-wrap items-center gap-3">
    <button type="submit" class="btn-primary"><x-icon name="check" class="size-4"/>{{ $receta->exists ? 'Guardar cambios' : 'Guardar receta' }}</button>
    <a href="{{ $receta->exists ? route('recetas.show', $receta) : route('recetas.index') }}" class="btn-secondary">Cancelar</a>
</div>

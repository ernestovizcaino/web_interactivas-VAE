@props(['name'])
@error($name)
    <p id="{{ $name }}-error" class="mt-2 text-sm text-destructive" role="alert">{{ $message }}</p>
@enderror

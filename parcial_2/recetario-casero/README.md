# Recetario casero — Parcial 2

Aplicación de Laravel 13 con vistas Blade, componentes shadcn/ui (React), Tailwind CSS 4, Inter y SQLite. Cada usuario guarda y gestiona sus propias recetas. La interfaz está en español.

## Funcionalidades

- Registro, inicio y cierre de sesión.
- Crear, consultar, editar y eliminar recetas con confirmación.
- Ingredientes y pasos como texto, uno por línea.
- Búsqueda por título y filtro por categoría combinables.
- Validaciones junto a cada campo y mensajes de éxito.
- Recetas privadas para cada usuario.

## Requisitos

- PHP 8.4.1 o superior, con las extensiones de Laravel y PDO SQLite.
- Composer 2.
- Node.js 22.12 o superior y npm.

## Instalación

```sh
cd parcial_2/recetario-casero
composer install
php -r "file_exists('.env') || copy('.env.example', '.env');"
php artisan key:generate
php -r "file_exists('database/database.sqlite') || touch('database/database.sqlite');"
php artisan migrate
npm ci
npm run build
php artisan serve --host=127.0.0.1 --port=8002
```

La configuración de ejemplo utiliza SQLite en `database/database.sqlite`. Las migraciones crean la base de datos necesaria.

Abre [el recetario local](http://127.0.0.1:8002). Para desarrollar el frontend, ejecuta `npm run dev` en otra terminal.

## Cuenta de demostración

Para cargar cinco recetas de ejemplo:

```sh
php artisan db:seed --class=RecetaSeeder
```

- Correo: `demo@recetario.test`
- Contraseña: `Cocina123!`

Cada cuenta nueva empieza con su recetario vacío.

## Comprobación por fases

1. **Autenticación:** registra una cuenta, cierra sesión y vuelve a entrar. El recetario inicial debe estar vacío.
2. **Crear y consultar:** guarda una receta y abre su detalle. Envía un formulario inválido para comprobar los errores junto a los campos.
3. **Editar y eliminar:** modifica una receta y guarda los cambios. Comprueba la confirmación antes de eliminar.
4. **Buscar y filtrar:** combina un título y una categoría. Entra con otra cuenta y comprueba que no puede ver las recetas de la primera.

## Pruebas automáticas

```sh
php artisan test --compact
```

Las pruebas utilizan SQLite en memoria y no modifican la base de datos local.

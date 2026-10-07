# Sistema de Torneos con Roles

Examen del segundo parcial — Programación Interactiva.

Aplicación web donde un **administrador** crea y gestiona torneos (fútbol, básquet, videojuegos, etc.) y los **jugadores** se inscriben en ellos. Los visitantes sin cuenta solo pueden consultar.

## Tecnologías

- **Laravel 13** (rutas, controladores, Form Requests, migraciones, seeders) + **Fortify** para autenticación
- **Inertia.js + React 19 + TypeScript**
- **Tailwind CSS 4** y **shadcn/ui** (preset `b3RXNlfwu`, estilo _radix-maia_, color lima, fuente Inter)
- **SQLite** como base de datos
- **Pest** para pruebas

## Instalación

Requisitos: PHP 8.3+, Composer, Node 20+ o Bun.

```bash
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed      # crea tablas, cuentas demo y torneos de ejemplo
bun install                     # o: npm install
bun run build                   # o: npm run build
php artisan serve
```

Abrir <http://localhost:8000>. Para desarrollo con recarga en vivo: `composer run dev`.

Para reiniciar los datos demo en cualquier momento: `php artisan migrate:fresh --seed`.

## Cuentas demo

| Rol           | Correo                 | Contraseña |
| ------------- | ---------------------- | ---------- |
| Administrador | `admin@torneos.test`   | `password` |
| Jugador       | `jugador@torneos.test` | `password` |

**¿Cómo se crea el admin?** Con el seeder (`database/seeders/DatabaseSeeder.php`), usando `User::factory()->admin()`. El registro público **siempre** crea usuarios con rol `jugador` (`app/Actions/Fortify/CreateNewUser.php`). Para convertir otra cuenta en admin:

```bash
php artisan tinker
>>> App\Models\User::where('email', 'correo@ejemplo.com')->update(['role' => 'admin']);
```

## Base de datos

- `users` — se agregó la columna `role` (`admin` | `jugador`, por defecto `jugador`).
- `torneos` — `nombre`, `juego`, `fecha`, `cupo` (defecto 16), `descripcion` (opcional), `estado` (`abierto` | `cerrado`).
- `inscripciones` — `torneo_id`, `user_id`, con índice único (`torneo_id`, `user_id`) para impedir duplicados y `ON DELETE CASCADE` hacia `torneos`.

**Regla de cerrado:** un torneo se considera cerrado si el admin lo marca `cerrado`, si su fecha ya pasó o si se llenó el cupo (`Torneo::estaCerrado()`). Lo cerrado/lleno no aparece en el listado (scope `Torneo::disponibles()`), pero se puede ver por su URL de detalle.

## Control de acceso

Middleware `role` (`app/Http/Middleware/EnsureUserHasRole.php`):

- `role:admin` protege todo `/admin/*`. Un **invitado** es enviado al login y un **jugador** es enviado al listado, ambos con un aviso en español.
- `role:jugador` protege inscribirse, cancelar y "Mis torneos" (el admin no se inscribe).

| Ruta                                            | Acceso        |
| ----------------------------------------------- | ------------- |
| `GET /torneos`, `GET /torneos/{id}`             | Público       |
| `GET /mis-torneos`                              | Jugador       |
| `POST/DELETE /torneos/{id}/inscripcion`         | Jugador       |
| `/admin/torneos` (resource completo)            | Administrador |
| `DELETE /admin/torneos/{id}/inscripciones/{id}` | Administrador |

## Cómo probar cada punto

1. **Registro, login y logout con roles**
    - Ir a _Registrarse_, crear una cuenta → aparece la etiqueta **Jugador** en el encabezado y el menú _Mis torneos_.
    - Cerrar sesión desde el avatar → _Cerrar sesión_.
    - Entrar como `admin@torneos.test` → se redirige al panel de **Administración**.

2. **CRUD de torneos (admin)**
    - _Administración → Nuevo torneo_. Enviar el formulario vacío, con fecha pasada o cupo 1 / 101: cada campo muestra su error en español.
    - Crear un torneo válido → aviso de éxito y aparece en la tabla.
    - Editar _Copa Universitaria de Fútbol 7_ (10 inscritos) y poner cupo 5 → error: _"El cupo no puede ser menor a 10: ya hay 10 jugadores inscritos."_
    - Eliminar un torneo con el icono de basura → diálogo de confirmación; sus inscripciones se borran en cascada.

3. **Listado público y detalle**
    - Sin sesión, abrir `/torneos`: solo se ven torneos abiertos, futuros y con plazas, ordenados por fecha. No aparecen _Mini torneo de Ping Pong_ (lleno), _Voleibol Mixto_ (cerrado) ni _Rocket League Cup_ (finalizado).
    - Usar el buscador y el filtro por juego. Si no hay resultados se muestra un mensaje.
    - Abrir un torneo para ver datos, contador de plazas y lista de participantes.
    - Abrir directamente el torneo lleno (`/torneos/6`) → se ve su detalle con el estado **Lleno**.

4. **Inscripciones (jugador)**
    - Como `jugador@torneos.test`, pulsar **Inscribirme** en un torneo → aviso de éxito y etiqueta **Inscrito**.
    - Intentar inscribirse otra vez, o en un torneo lleno/cerrado (por ejemplo con una petición directa) → aviso de error claro.
    - _Mis torneos_ muestra los próximos y el historial. **Cancelar** pide confirmación y libera la plaza (el contador baja). En torneos ya realizados no se puede cancelar.

5. **Gestión de inscritos (admin)**
    - En _Administración_, menú ⋯ → _Ver inscritos_ → **Dar de baja** a cualquier jugador (con confirmación).
    - Como jugador o invitado, abrir `/admin/torneos` → redirección con el aviso _"Solo los administradores pueden acceder a esa sección."_

6. **Mensajes en español**: validaciones (`app/Http/Requests/Admin/TorneoRequest.php`, `lang/es/`) y avisos (toasts) están en español.

## Pruebas automatizadas

```bash
php artisan test
```

Cubren roles y permisos, validaciones del CRUD, cupo mínimo, borrado en cascada, listado de disponibles, duplicados, torneos llenos/cerrados/pasados y cancelación.

## Estructura principal

```
app/Enums/                    Role, EstadoTorneo
app/Http/Controllers/         TorneoController (público), InscripcionController (jugador)
app/Http/Controllers/Admin/   TorneoController (CRUD), InscripcionController (bajas)
app/Http/Middleware/          EnsureUserHasRole
app/Http/Requests/Admin/      TorneoRequest (validación + mensajes)
app/Models/                   Torneo, Inscripcion, User
resources/js/pages/           torneos/*, admin/torneos/*, auth/*, settings/*
resources/js/components/torneos/  tarjetas, insignias de estado, contador de plazas, formulario, confirmaciones
```

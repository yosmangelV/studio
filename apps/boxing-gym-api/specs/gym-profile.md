# Spec: Datos del Gimnasio (Gym Profile)

**Fase:** 2 — MVP  
**Estado:** `implemented` (pendiente de correr la migración `003` en Supabase)  
**Última actualización:** 2026-10-31

---

## Historia

> Como administrador del gimnasio, quiero editar desde el panel el contacto, los horarios y las clases que muestra la web pública, para mantenerlos al día sin depender de un despliegue.

> Como visitante de la web, quiero ver esos datos al instante, aunque la API esté dormida.

---

## Contexto y decisiones

- Hoy estos datos viven en `projects/boxing-gym/src/app/core/config/gym.config.ts`, con valores de relleno en producción (`+34 XXX XXX XXX`, `Calle X`). Cada cambio exige commit y despliegue.
- **Lectura pública directa desde Supabase** (clave anon + RLS de solo lectura), no a través de FastAPI. La API corre en el plan gratuito de Render y tarda 30–60 s en despertar; la landing no puede depender de eso. Supabase está siempre activo.
- **Escritura solo a través de FastAPI**, con `require_admin` y validación Pydantic, como el resto de módulos. Ninguna tabla tiene políticas de escritura: solo la `service_role` del backend puede escribir.
- Esta excepción a "todo pasa por la API" aplica **solo** a la lectura pública de estas tablas, que no contienen datos personales.
- **Las cifras de la web se calculan, no se escriben** (`design.md`: nunca cifras inventadas):
  - *Alumnos activos*: contados en la base de datos y redondeados allí mismo; el número exacto nunca sale de Postgres.
  - *Años*: desde la fecha de inauguración.
  - *Modalidades*: número de clases activas.
- **Fuera de la base de datos:** la marca (nombre, logo, colores, tipografías) y el texto de "Sobre nosotros". Cambian rara vez y su cambio debe pasar por revisión (`design.md`).
- **Conflicto abierto con `CLAUDE.md`:** la regla *"RLS enforced — never bypass it with service role key"* no se cumple hoy: `app/database.py` crea el cliente con `service_role` y todos los módulos autorizan con `require_admin`. Esta spec sigue la práctica real (RLS niega todo a `anon` salvo las lecturas públicas; FastAPI autoriza las escrituras). Decidir en la revisión: actualizar la regla a la práctica real, o migrar a un cliente por petición con el JWT del usuario y políticas por permiso (cambio transversal, fuera de esta spec; cobra sentido cuando los alumnos inicien sesión y vean sus propios datos).

---

## Prerrequisito de seguridad

Las migraciones `001` y `002` no activan RLS en `students` ni `payments`. La clave anon es pública (va en el bundle del frontend).

Comprobación del 2026-10-31 con la clave anon (solo recuento, sin datos): `students` tiene 1 fila y anon ve 0, así que RLS está activo (activado desde el dashboard, no en migraciones). `payments` está vacía: no se puede confirmar.

La migración `003` activa RLS en `students` y `payments` **sin políticas**, para que la protección quede en código y no dependa de un ajuste manual. Para la API no cambia nada (`service_role` bypasea RLS).

---

## Modelo de datos

### Tabla `gym_profile` (una sola fila)

| Campo                         | Tipo      | Requerido | Notas                                                   |
|-------------------------------|-----------|-----------|---------------------------------------------------------|
| `id`                          | boolean   | auto      | PK fija `true` con `check (id)`: garantiza una sola fila |
| `phone`                       | text      | no        | E.164 (`+34658078039`). Máx. 20                         |
| `whatsapp`                    | text      | no        | Solo dígitos con prefijo. Null = sin botón de WhatsApp  |
| `email`                       | text      | no        |                                                         |
| `address`                     | text      | no        | Una línea. El frontend genera el enlace a Google Maps (`maps/search/?api=1&query=`) |
| `instagram`                   | text      | no        | Usuario sin `@`                                         |
| `founded_on`                  | date      | no        | Inauguración de la escuela. Null = no se muestran los años |
| `active_students_min_display` | smallint  | sí        | Default `20`. Por debajo, la cifra de alumnos no se publica |
| `updated_at`                  | timestamp | auto      | Trigger propio `gym_profile_touch_updated_at()` (la BD real no tiene el `update_updated_at()` de `001`) |
| `updated_by`                  | uuid      | auto      | Admin que guardó (del JWT)                              |

Un campo vacío **no se muestra** en la web. Nunca se guardan valores de relleno.

### Tabla `gym_schedule_slots`

Franjas horarias estructuradas: el frontend las formatea por idioma con `Intl`, así que no necesitan traducción. Un día sin franjas se muestra como **cerrado** (no se guarda "cerrado").

| Campo        | Tipo     | Requerido | Notas                                     |
|--------------|----------|-----------|-------------------------------------------|
| `id`         | uuid     | auto      |                                           |
| `day_from`   | smallint | sí        | ISO 1 = lunes … 7 = domingo               |
| `day_to`     | smallint | sí        | `>= day_from`                             |
| `opens_at`   | time     | sí        |                                           |
| `closes_at`  | time     | sí        | `> opens_at`                              |
| `label`      | jsonb    | no        | Grupo de la franja: `{ "es": "Adultos", "en": "Adults" }` |
| `sort_order` | smallint | sí        |                                           |

Franjas contiguas del mismo grupo son sesiones distintas (no se fusionan). El frontend agrupa por rango de días y, dentro, por etiqueta.

### Tabla `gym_classes`

| Campo         | Tipo     | Requerido | Notas                              |
|---------------|----------|-----------|------------------------------------|
| `id`          | uuid     | auto      |                                    |
| `name`        | jsonb    | sí        | `{ "es": "Boxeo", "en": "Boxing" }` |
| `description` | jsonb    | sí        | Mismo formato                      |
| `sort_order`  | smallint | sí        |                                    |
| `is_active`   | boolean  | sí        | Default `true`. Inactivas no se muestran ni cuentan como modalidad |

**Contenido traducible:** `jsonb` con claves de idioma (`es` obligatorio, `en` opcional). Si falta el idioma pedido, el frontend usa `es`.

---

## Cifras públicas

| Cifra | Origen | Se publica si |
|---|---|---|
| Alumnos activos | `students where is_active`, contado y redondeado en Postgres | recuento `>= active_students_min_display` |
| Años formando | `founded_on`, calculado en el frontend | `founded_on` no es null y han pasado ≥ 1 año |
| Modalidades | `count(gym_classes where is_active)` | ≥ 1 |

**Alumnos activos sin exponer `students`:** una función `security definer` devuelve **solo un número ya redondeado** (decenas hacia abajo, p. ej. 57 → 50, mostrado como "+50") o `null` si no llega al mínimo. La clave anon puede ejecutarla, pero no puede leer la tabla; el recuento exacto nunca sale de la base de datos.

```sql
create function public_active_students_rounded()
returns integer
language sql stable security definer
set search_path = public
as $$
  select case
    when count(*) >= (select active_students_min_display from gym_profile)
    then (count(*) / 10) * 10
  end
  from students where is_active;
$$;

revoke all on function public_active_students_rounded() from public;
grant execute on function public_active_students_rounded() to anon, authenticated;
```

Los textos de las cifras ("alumnos activos", "años formando campeones", "modalidades") son UI fija y se traducen con i18n (`xlf`), no van a la base de datos.

---

## Lectura pública (Supabase, sin API)

Una vista agrega todo en **una sola petición**:

```sql
create view public_gym_profile
with (security_invoker = true) as
select
  (select to_jsonb(p) - 'id' - 'updated_by' - 'active_students_min_display' from gym_profile p) as profile,
  (select coalesce(jsonb_agg(s order by s.sort_order), '[]') from gym_schedule_slots s)          as schedule,
  (select coalesce(jsonb_agg(k order by k.sort_order), '[]') from gym_classes k where k.is_active) as classes,
  public_active_students_rounded()                                                                 as active_students;
```

`security_invoker = true` hace que la vista respete el RLS de las tablas (sin él, una vista se ejecuta con los permisos de su dueño y lo saltaría). La única puerta a `students` es la función de arriba.

Frontend: `supabase.from('public_gym_profile').select('*').single()`.

---

## Endpoints (admin)

Las listas se guardan **completas** (reemplazo atómico), no fila a fila: son listas cortas que el admin edita como un formulario. El reemplazo se hace con una función Postgres (`rpc`) para que sea una transacción; el cliente Python de Supabase no tiene transacciones.

### `GET /gym-profile`
Todo el perfil, **incluidas** clases inactivas y el umbral de alumnos. Solo admin.

**Response 200:**
```json
{
  "profile": { "phone": "+34658078039", "whatsapp": "34658078039", "email": null, "address": "C. de Lope de Vega, 10, 28350 Ciempozuelos, Madrid", "instagram": null, "founded_on": null, "active_students_min_display": 20, "updated_at": "2026-10-31T10:00:00Z" },
  "schedule": [ { "id": "uuid", "day_from": 1, "day_to": 5, "opens_at": "18:30", "closes_at": "19:30", "label": { "es": "Adultos", "en": "Adults" }, "sort_order": 2 } ],
  "classes": [ { "id": "uuid", "name": { "es": "Boxeo", "en": "Boxing" }, "description": { "es": "…", "en": "…" }, "sort_order": 0, "is_active": true } ]
}
```

### `PUT /gym-profile/profile`
Reemplaza el perfil. Campos omitidos o `null` se vacían. Solo admin.

### `PUT /gym-profile/schedule`
Reemplaza todas las franjas. Body: `{ "slots": [ … ] }`. Solo admin.

### `PUT /gym-profile/classes`
Reemplaza todas las clases. Body: `{ "classes": [ … ] }`. Solo admin.

Todos devuelven **200** con el perfil completo actualizado (mismo shape que `GET`).

**Errores:**
| Código | Motivo |
|--------|--------|
| 401 / 403 | Sin token / no admin |
| 422 | Validación: `day_to < day_from`, `closes_at <= opens_at`, franjas solapadas el mismo día y grupo, `name.es` vacío, `whatsapp` con caracteres no numéricos, email inválido, `founded_on` en el futuro, `active_students_min_display < 1` |

---

## Migración `003_create_gym_profile.sql`

1. Activar RLS en `students` y `payments` (prerrequisito de seguridad).
2. Crear `gym_profile`, `gym_schedule_slots`, `gym_classes` con sus `check`.
3. Activar RLS en las tres y crear **solo** políticas de lectura:
   ```sql
   create policy "public read" on gym_profile        for select to anon, authenticated using (true);
   create policy "public read" on gym_schedule_slots for select to anon, authenticated using (true);
   create policy "public read" on gym_classes        for select to anon, authenticated using (is_active);
   ```
4. Crear `public_active_students_rounded()` y la vista `public_gym_profile`; `grant select` en la vista a `anon, authenticated`.
5. Funciones `replace_gym_schedule(jsonb)` y `replace_gym_classes(jsonb)` (`security invoker`: no necesitan más permisos que los de quien llama; ejecutables solo por `service_role`). Usan `delete … where true` porque Supabase bloquea `DELETE` sin `WHERE` (`safeupdate`).
6. Datos iniciales:

   **Perfil:** teléfono y WhatsApp `+34658078039`; dirección `C. de Lope de Vega, 10, 28350 Ciempozuelos, Madrid`; `founded_on` `2024-01-01` (año confirmado, día y mes por defecto, corregible desde `/settings`); email e Instagram vacíos hasta tenerlos.

   **Horario** (sábado y domingo cerrado):

   | Días | Franja | Grupo |
   |---|---|---|
   | Martes – Jueves | 11:00 – 12:00 | Abierta a todos / Open to all |
   | Lunes – Viernes | 17:30 – 18:30 | Juniors |
   | Lunes – Viernes | 18:30 – 19:30 | Adultos / Adults |
   | Lunes – Viernes | 19:30 – 20:30 | Adultos / Adults |
   | Lunes – Viernes | 20:30 – 21:30 | Adultos / Adults |

   **Clases:** Boxeo, Fitness con Saco, Juniors (antes "Kids Boxing", mismo nombre que su franja horaria) y Sparring, con traducción al inglés.

---

## Frontend

### Servicio `GymProfileService` (`core/gym-profile/`)
- `profile = resource(...)` que lee `public_gym_profile` por Supabase.
- **Nunca bloquea el render:** la marca y los textos fijos se pintan al instante; los datos salen de la última respuesta guardada en `localStorage` (y del service worker) mientras llega la nueva, y se usa esa copia si Supabase falla. En la primera visita sin caché, las secciones aparecen en cuanto responde Supabase.
- Expone `computed()` ya listos para las plantillas (enlace `wa.me`, enlace de Instagram, enlace de Google Maps desde la dirección, horario agrupado y formateado por idioma, años desde `founded_on`, cifras visibles), sin llamadas a métodos en las plantillas (`CLAUDE.md`).
- Escrituras del admin: a través del cliente generado de la API (`npm run generate:api`), como `students` y `payments`.

### Service worker (`ngsw-config.json`)
Añadir un `dataGroup` para la URL REST de Supabase de `public_gym_profile`, estrategia `freshness` con `timeout: 3s` y `maxAge: 1d`: si Supabase tarda, se sirve la última copia.

### Sin valores por defecto en el código
`gym.config.ts` conserva solo nombre, marca, "Sobre nosotros" y copyright. El contacto, los horarios, las clases y las cifras ya no existen en el código: no hay copia que se pueda quedar desactualizada ni datos de relleno. Un campo vacío o una cifra nula se oculta.

### Pantalla de admin `/settings`
Ruta protegida por `adminGuard`, con tres bloques: perfil (contacto, fecha de inauguración, umbral de alumnos), horarios y clases. Cada bloque guarda por separado con su `PUT`.

---

## Relación con otras tareas

- **Splash / carga inicial:** con este diseño la landing no espera datos, así que el splash fijo de 2,8 s (`app.ts`) deja de tener motivo. Su retirada es una tarea aparte.
- **`design.md` (boxing-gym):** las cifras se calculan y solo se muestran cuando son reales y significativas; los campos vacíos se ocultan (Floor 3 y 4). El checklist de "Stats … verified" queda resuelto por diseño.

---

## Fuera de alcance (esta fase)

- "Sobre nosotros", nombre y marca editables
- Varios gimnasios (multi-tenant): las tablas no llevan `gym_id`; añadirlo será una migración
- Horarios por clase (qué clase se da en cada franja)
- Historial de cambios / auditoría más allá de `updated_at` y `updated_by`
- Subida de imágenes

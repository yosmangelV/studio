# Spec: Gestión de Usuarios del Sistema (User Management)

**Fase:** 1.5 — Acceso al sistema  
**Estado:** `in-progress`  
**Última actualización:** 2026-09-29

---

## Historia

> Como administrador del gimnasio, quiero poder dar acceso al sistema a un alumno al momento de crearlo (o en cualquier momento), para que pueda iniciar sesión con email y contraseña y tenga los permisos que yo elija.

---

## Contexto

Supabase gestiona la autenticación. Cada usuario con acceso al sistema tiene una entrada en `auth.users` (gestionada por Supabase Auth). La tabla `students` se vincula a ese usuario mediante `auth_user_id`.

Los permisos se almacenan en `app_metadata.permissions` del usuario en Supabase Auth, como un array de strings: `["admin"]`, `["student"]`, `["student", "instructor"]`, etc.

---

## Cambio en el modelo de datos de `students`

Se agrega una columna nullable para vincular un alumno a su cuenta de sistema:

| Campo          | Tipo | Requerido | Notas                                             |
|----------------|------|-----------|---------------------------------------------------|
| `auth_user_id` | uuid | no        | FK a `auth.users(id)`. Null si no tiene acceso al sistema. |

**Migración SQL:**
```sql
alter table students
  add column auth_user_id uuid references auth.users(id);
```

---

## Endpoint modificado: `POST /students`

El endpoint acepta un campo opcional `system_access`. Si está presente, se crea un usuario en Supabase Auth **antes** de insertar el registro del alumno.

### Request body:
```json
{
  "full_name": "Roberto García",
  "email": "roberto@gym.com",
  "phone": "+34600000001",
  "birth_date": "1980-01-01",
  "enrollment_date": "2024-01-01",
  "level": "advanced",
  "is_active": true,
  "system_access": {
    "permissions": ["admin"],
    "password": "contraseña-segura"
  }
}
```

### Flujo:
1. Validar el body (Pydantic).
2. Si `system_access` está presente:
   a. Llamar a `supabase.auth.admin.create_user()` con email, password y `app_metadata.permissions`.
   b. Confirmar el email automáticamente (`email_confirm: true`) — no enviamos emails de confirmación.
   c. Si falla (email duplicado en auth, password débil, etc.) → retornar error, NO crear el alumno.
3. Insertar el alumno en `students` con `auth_user_id` = UUID del usuario auth creado (o null).
4. Si el insert falla después de crear el auth user → eliminar el auth user (rollback manual) y retornar error.

### Response 201:
```json
{
  "id": "uuid",
  "full_name": "Roberto García",
  "email": "roberto@gym.com",
  "auth_user_id": "uuid-del-auth-user",
  ...
}
```

### Errores adicionales:
| Código | Motivo                                                   |
|--------|----------------------------------------------------------|
| 409    | Email ya registrado (en students O en auth.users)        |
| 400    | `system_access` presente pero `password` ausente o muy corta |

---

## Reglas de negocio

1. Si `system_access` no se envía, el alumno se crea sin acceso al sistema (`auth_user_id = null`).
2. La contraseña solo se recibe al **crear** el usuario auth. No existe endpoint de cambio de contraseña en esta fase.
3. Los permisos válidos son: `"student"`, `"instructor"`, `"admin"`. Se persisten tal como vienen del cliente — el backend no valida el contenido del array en esta fase.
4. Un alumno con `auth_user_id` no nulo tiene acceso al sistema; uno con `null` no.
5. Si un alumno ya tiene `auth_user_id`, el `PATCH /students/{id}` no modifica su acceso (fuera de alcance en esta fase).

---

## Fuera de alcance (esta fase)

- Dar/quitar acceso al sistema a un alumno existente (agregar `auth_user_id` después de la creación)
- Cambiar contraseña de un usuario del sistema
- Cambiar permisos de un usuario existente
- Eliminar el auth user al hacer `DELETE /students/{id}`
- Listado de usuarios con acceso al sistema

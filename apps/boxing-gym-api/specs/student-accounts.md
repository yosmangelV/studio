# Spec: Cuentas de alumno (Student Accounts)

**Fase:** 3 — Alumnos en la app  
**Estado:** `draft`  
**Última actualización:** 2026-11-16  
**Decisión:** [ADR 0005](../../../docs/decisions/0005-boxing-gym-student-accounts.md). Sustituye a [`user-management.md`](user-management.md).

---

## Historia

> Como administrador del gimnasio, quiero dar acceso a la app a un alumno registrando su email, para que reciba una invitación, elija su contraseña y pueda hacer pedidos y apuntarse a clases desde la web o el móvil.

> Como alumno, quiero poder recuperar mi contraseña si la olvido, sin depender del administrador.

---

## Contexto

- Las cuentas viven en Supabase Auth. `students.auth_user_id` enlaza al alumno con su usuario, y los permisos están en `app_metadata.permissions` (`student`, `instructor`, `admin`).
- Hoy `POST /students` y `PATCH /students/{id}` con `system_access` crean el usuario con una contraseña aleatoria que nadie recibe y `email_confirm: true`. Esas cuentas no se pueden usar. Esta spec cambia **cómo** se crea la cuenta, no **quién** la crea: sigue siendo solo el admin.
- No hay registro abierto: ningún endpoint ni pantalla permite crearse una cuenta.

---

## Dar acceso: invitación

`POST /students` y `PATCH /students/{id}` mantienen el campo `system_access: { "permissions": [...] }`. Cambia lo que hacen con él cuando el alumno **no** tiene cuenta:

1. Llamar a `supabase.auth.admin.invite_user_by_email(email, redirect_to=AUTH_REDIRECT_URL)`. Supabase crea el usuario sin contraseña y envía el email de invitación.
2. Poner `app_metadata.permissions` con `update_user_by_id`. Los permisos nunca van en `user_metadata`, que el propio usuario puede modificar.
3. Guardar `auth_user_id` en el alumno.
4. Si el paso 1 falla, no se crea ni se modifica el alumno. Si falla el 2 o el 3, se borra el usuario recién invitado (el rollback manual que ya existe) y se devuelve el error.

Si el alumno **ya** tiene cuenta, `system_access` solo actualiza los permisos, como hoy.

Desaparece la generación de contraseñas en `app/students/service.py`.

### `POST /students/{id}/invitation`
Reenvía la invitación. Solo admin.

| Código | Motivo |
|---|---|
| 204 | Invitación reenviada |
| 404 | Alumno no encontrado |
| 409 | El alumno no tiene cuenta (darle acceso con `system_access`) |
| 409 | La cuenta ya está activada (el alumno ya eligió contraseña): debe usar "¿Olvidaste tu contraseña?" |

El estado de la invitación sale de Supabase: un usuario invitado que no ha aceptado tiene `invited_at` y no tiene `email_confirmed_at`.

### Campo nuevo en la respuesta de alumno

`access_status`: `none` (sin cuenta) | `invited` (invitación pendiente) | `active` (ya eligió contraseña). Se calcula a partir del usuario de Supabase, como ya se hace con `permissions`. El panel lo usa para mostrar "Reenviar invitación".

---

## Elegir y recuperar la contraseña (frontend)

- **`/auth/set-password`:** página pública a la que llevan los enlaces de invitación y de recuperación. Supabase abre la sesión con el token del enlace, y el alumno escribe la contraseña dos veces (`supabase.auth.updateUser({ password })`). Al terminar, entra en su área.
- **"¿Olvidaste tu contraseña?"** en `/login`: pide el email y llama a `supabase.auth.resetPasswordForEmail(email, { redirectTo })`. La respuesta es siempre la misma, exista o no el email, para no revelar quién tiene cuenta.
- **Cuentas creadas antes de esta spec** (con contraseña aleatoria) entran por "¿Olvidaste tu contraseña?". No hace falta migrarlas.
- **Enlace caducado:** la página lo explica y ofrece pedir otro: recuperación para cuentas activas, o pedir al gimnasio que reenvíe la invitación.

---

## Identidad del alumno en la API

Dependencia nueva `get_current_student` en `app/auth.py`, para todos los endpoints "míos" (pedidos, clases):

1. Exige el permiso `student` en el JWT.
2. Busca el alumno por `auth_user_id = sub`.
3. Sin alumno enlazado → **403**. Alumno con `is_active = false` → **403** con `detail` "Cuenta inactiva", para que la app muestre un mensaje claro.
4. Devuelve el alumno. Los endpoints usan **su** `id`: nunca aceptan `student_id` en la URL, el body ni la query.

Un admin que no es alumno no pasa por esta dependencia: los endpoints de alumno y los de admin son distintos.

---

## Área del alumno (frontend)

- `studentGuard`: exige el permiso `student`. Hoy `staffGuard` manda a los alumnos a la landing; pasa a mandarlos a su área.
- Tras el login, se redirige por rol: staff al panel y alumnos a su área.
- El área del alumno es la base de las pantallas de pedidos y clases. Esta spec solo crea el contenedor: la navegación y un inicio con su nombre.

---

## Configuración (por escuela)

| Dónde | Qué |
|---|---|
| Supabase → Auth → SMTP | Proveedor de email propio. El servicio por defecto solo envía al equipo del proyecto |
| Supabase → Auth → URL configuration | `https://<dominio>/auth/set-password` como redirect permitido |
| Supabase → Auth → Email templates | Textos de invitación y recuperación en español, con el nombre de la escuela |
| API `.env` | `AUTH_REDIRECT_URL` |

En la app nativa, el mismo enlace `https://` abre la app gracias a los universal links (iOS) y app links (Android) del dominio de la escuela. Así una sola URL de redirect sirve para la web y para el móvil. Se configura con el setup de Capacitor ([ADR 0004](../../../docs/decisions/0004-boxing-gym-mobile-capacitor.md)).

---

## Pruebas

- Dar acceso invita y pone los permisos en `app_metadata`. Un fallo en Supabase no deja alumnos a medias.
- Reenviar: 204 si la invitación está pendiente, 409 sin cuenta o con la cuenta activa, y 403 si no es admin.
- `get_current_student`: 403 sin permiso `student`, sin alumno enlazado o con el alumno inactivo.
- `tests/test_router_guards.py` sigue pasando: el router nuevo declara su guard.

---

## Fuera de alcance

- Quitar el acceso borrando el usuario. Se hace con `is_active = false`.
- Login con Google o Apple, y enlaces mágicos sin contraseña.
- Que el alumno cambie su email.
- Instructores con área propia.

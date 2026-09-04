# Spec: Módulo de Alumnos (Students)

**Fase:** 1 — MVP  
**Estado:** `in-progress`  
**Última actualización:** 2026-06-28

---

## Historia

> Como administrador del gimnasio, quiero poder registrar, consultar, editar y desactivar alumnos, para llevar un control de quiénes están activos y cuál es su nivel actual.

---

## Modelo de datos

| Campo             | Tipo      | Requerido | Notas                                           |
|-------------------|-----------|-----------|-------------------------------------------------|
| `id`              | UUID      | auto      | Generado por Supabase                           |
| `full_name`       | string    | sí        | Min 2 chars, max 100 chars                      |
| `email`           | string    | sí        | Formato email válido, único en la tabla         |
| `phone`           | string    | no        | Max 20 chars                                    |
| `birth_date`      | date      | sí        | Fecha de nacimiento                             |
| `enrollment_date` | date      | sí        | Fecha de ingreso al gimnasio                    |
| `level`           | enum      | sí        | `beginner` \| `intermediate` \| `advanced`      |
| `is_active`       | boolean   | sí        | Default `true`. No se eliminan registros, se desactivan |
| `weight`          | decimal   | no        | Peso en kg. Opcional, principalmente para peleadores activos |
| `created_at`      | timestamp | auto      | Generado por Supabase                           |
| `updated_at`      | timestamp | auto      | Actualizado automáticamente por Supabase        |

---

## Endpoints

### `GET /students`
Retorna la lista de todos los alumnos.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "full_name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+1234567890",
    "enrollment_date": "2024-01-15",
    "level": "beginner",
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
]
```

---

### `POST /students`
Registra un nuevo alumno.

**Request body:**
```json
{
  "full_name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "+1234567890",
  "enrollment_date": "2024-01-15",
  "level": "beginner",
  "is_active": true
}
```

**Response 201:** El alumno creado (mismo shape que arriba).

**Errores:**
| Código | Motivo                        |
|--------|-------------------------------|
| 422    | Campos inválidos o faltantes (FastAPI/Pydantic lo maneja automáticamente) |
| 409    | Email ya registrado — capturar constraint de Supabase y retornar 409, NO dejar que el 500 llegue al cliente |

---

### `GET /students/{id}`
Retorna un alumno por ID.

**Response 200:** El alumno.  
**Response 404:** `{ "detail": "Student not found" }`

---

### `PATCH /students/{id}`
Actualiza campos específicos de un alumno. Solo se envían los campos que cambian.

**Request body** (todos opcionales):
```json
{
  "full_name": "Juan Pérez Actualizado",
  "level": "intermediate",
  "is_active": false
}
```

**Response 200:** El alumno actualizado.  
**Response 404:** `{ "detail": "Student not found" }`

> **Nota de diseño:** Se usa `PATCH` (no `PUT`) porque permite actualizar campos individuales sin enviar el objeto completo. `PUT` reemplazaría todo el registro.

---

### `DELETE /students/{id}`
Elimina un alumno de la base de datos.

**Response 204:** Sin contenido.  
**Response 404:** `{ "detail": "Student not found" }`

> **Nota de diseño:** A futuro, evaluar si tiene más sentido un "soft delete" (marcar `is_active = false`) en vez de eliminar el registro. Para MVP, se elimina físicamente.

---

## Reglas de negocio

1. El email debe ser único por alumno.
2. Un alumno desactivado (`is_active = false`) sigue apareciendo en la lista — no se filtra automáticamente.
3. No existe recuperación de alumnos eliminados (no hay soft delete en MVP).
4. El nivel solo puede ser uno de los tres valores del enum.

---

## Tabla en Supabase

```sql
create table students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) >= 2 and char_length(full_name) <= 100),
  email text not null unique,
  phone text check (char_length(phone) <= 20),
  birth_date date not null,
  enrollment_date date not null,
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  is_active boolean not null default true,
  weight numeric(5, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Campos agregados en sesión 3:
-- alter table students add column birth_date date not null;
-- alter table students add column weight numeric(5, 2);
```

> El trigger para `updated_at` automático se configura por separado en Supabase.

---

## Fuera de alcance (para esta fase)

- Filtrado por nivel o estado activo
- Paginación
- Búsqueda por nombre
- Historial de cambios de nivel
- Relación con pagos o clases

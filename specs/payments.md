# Spec: Módulo de Pagos (Payments)

**Fase:** 2 — MVP  
**Estado:** `draft`  
**Última actualización:** 2026-08-28

---

## Historia

> Como administrador del gimnasio, quiero registrar los pagos de los alumnos (mensualidades y materiales), para llevar un control de quién ha pagado, quién está en impago, y obtener métricas del método de pago usado.

---

## Contexto y reglas de negocio

- Los pagos son en efectivo (y otros métodos manuales). **No hay procesamiento online.**
- Solo el rol `admin` puede registrar, ver o anular pagos. Los alumnos no tienen acceso a este módulo.
- Cada alumno debe pagar su mensualidad dentro de los **primeros 5 días del mes**. A partir del día 6, su estado pasa a "vencido".
- Si un alumno no paga durante **2 meses consecutivos completos**, se le marca como inactivo (`is_active = false` en la tabla `students`).
- No puede existir más de un pago de mensualidad (`monthly_fee`) para el mismo alumno en el mismo mes y año — el sistema debe rechazarlo.
- El importe de la mensualidad puede variar por alumno, por lo que el admin ingresa el monto cada vez.
- Los pagos de material (`material`) no tienen periodo mensual asociado. Se describen libremente con el campo `notes`.

---

## Modelo de datos

### Tabla `payments`

| Campo            | Tipo      | Requerido       | Notas                                                                 |
|------------------|-----------|-----------------|-----------------------------------------------------------------------|
| `id`             | UUID      | auto            | Generado por Supabase                                                 |
| `student_id`     | UUID FK   | sí              | Referencia a `students.id`                                            |
| `type`           | enum      | sí              | `monthly_fee` \| `material`                                           |
| `period_year`    | int       | solo `monthly_fee` | Año del periodo (ej: 2026). Null si type es `material`             |
| `period_month`   | int 1–12  | solo `monthly_fee` | Mes del periodo (ej: 8 para agosto). Null si type es `material`    |
| `amount`         | decimal   | sí              | Importe pagado. Positivo. Puede variar por alumno                     |
| `payment_method` | enum      | sí              | `cash` \| `transfer` \| `bizum`                                       |
| `paid_at`        | timestamp | auto            | Momento en que se registra el pago. Default `now()`                  |
| `created_by`     | UUID      | sí              | UUID del admin que registró el pago (extraído del JWT)                |
| `notes`          | text      | no              | Descripción libre. Obligatorio para `material` (ej: "Kit guantes M") |
| `created_at`     | timestamp | auto            | Generado por Supabase                                                 |

**Constraint único:** No puede haber dos registros con el mismo `student_id` + `period_year` + `period_month` cuando `type = 'monthly_fee'`.

---

## Endpoints

### `POST /payments`
Registra un pago. Solo admin.

**Request body:**
```json
{
  "student_id": "uuid",
  "type": "monthly_fee",
  "period_year": 2026,
  "period_month": 8,
  "amount": 50.00,
  "payment_method": "cash",
  "notes": null
}
```

Para `type: material`:
```json
{
  "student_id": "uuid",
  "type": "material",
  "amount": 35.00,
  "payment_method": "bizum",
  "notes": "Kit guantes talla M + casco"
}
```

**Response 201:** El pago registrado.
```json
{
  "id": "uuid",
  "student_id": "uuid",
  "type": "monthly_fee",
  "period_year": 2026,
  "period_month": 8,
  "amount": 50.00,
  "payment_method": "cash",
  "paid_at": "2026-08-03T10:30:00Z",
  "created_by": "uuid",
  "notes": null,
  "created_at": "2026-08-03T10:30:00Z"
}
```

**Errores:**
| Código | Motivo |
|--------|--------|
| 400    | `period_year` / `period_month` requeridos cuando `type` es `monthly_fee` |
| 400    | `notes` requerido cuando `type` es `material` |
| 404    | Alumno no encontrado |
| 409    | Ya existe un pago de mensualidad para ese alumno en ese mes y año |
| 422    | Campos inválidos o faltantes (Pydantic) |

---

### `GET /payments`
Lista pagos con filtros y paginación. Solo admin.

**Query params:**
| Param            | Tipo   | Default | Descripción                              |
|------------------|--------|---------|------------------------------------------|
| `type`           | string | —       | Filtrar por tipo: `monthly_fee` / `material` |
| `period`         | string | —       | Filtrar por periodo `YYYY-MM` (ej: `2026-08`) |
| `student_id`     | UUID   | —       | Filtrar por alumno                       |
| `payment_method` | string | —       | Filtrar por método de pago               |
| `limit`          | int    | 20      | Máximo de registros a devolver (max 100) |
| `offset`         | int    | 0       | Desde qué registro empezar               |

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "type": "monthly_fee",
      "period_year": 2026,
      "period_month": 8,
      "amount": 50.00,
      "payment_method": "cash",
      "paid_at": "2026-08-03T10:30:00Z",
      "created_by": "uuid",
      "notes": null,
      "created_at": "2026-08-03T10:30:00Z"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

> `total` es el número de registros que coinciden con los filtros aplicados (no solo los devueltos). Permite al cliente saber cuántas páginas hay en total.

---

### `GET /payments/summary`
Resumen del mes para el admin: quién pagó, quién no, quién está en riesgo de inactividad. Solo admin.

> **Nota de diseño:** Este endpoint debe registrarse en el router **antes** que `GET /payments/{id}` para que FastAPI no interprete la palabra `summary` como un UUID.

**Query params:**
| Param    | Tipo   | Descripción                                    |
|----------|--------|------------------------------------------------|
| `period` | string | `YYYY-MM`. Default: mes y año actual            |

**Response 200:**
```json
{
  "period": "2026-08",
  "paid": [
    { "student_id": "uuid", "student_name": "Juan Pérez", "paid_at": "2026-08-03T10:30:00Z", "amount": 50.00 }
  ],
  "pending": [
    { "student_id": "uuid", "student_name": "María López" }
  ],
  "overdue": [
    { "student_id": "uuid", "student_name": "Carlos Ruiz" }
  ],
  "at_risk_of_inactivity": [
    { "student_id": "uuid", "student_name": "Ana Torres", "months_unpaid": 2 }
  ]
}
```

**Lógica de clasificación** (para el mes consultado):
- `paid`: tiene un pago `monthly_fee` en ese mes.
- `pending`: no tiene pago y el día actual es ≤ 5 (aplica solo si se consulta el mes en curso).
- `overdue`: no tiene pago y el día actual es > 5 (o se consulta un mes pasado sin pago).
- `at_risk_of_inactivity`: alumnos activos sin pago en el mes consultado **y** en el mes anterior.

---

### `GET /payments/analytics`
Métricas de pagos por método. Solo admin.

> **Nota de diseño:** Igual que `summary`, debe registrarse antes que `GET /payments/{id}`.

**Query params:**
| Param    | Tipo   | Descripción                     |
|----------|--------|---------------------------------|
| `period` | string | `YYYY-MM`. Default: mes actual  |
| `type`   | string | `monthly_fee` / `material` / omitir para todos |

**Response 200:**
```json
{
  "period": "2026-08",
  "total_amount": 1500.00,
  "total_payments": 18,
  "by_method": {
    "cash":     { "count": 10, "amount": 800.00 },
    "transfer": { "count": 5,  "amount": 500.00 },
    "bizum":    { "count": 3,  "amount": 200.00 }
  }
}
```

---

### `GET /payments/{id}`
Detalle de un pago. Solo admin.

**Response 200:** El pago.  
**Response 404:** `{ "detail": "Payment not found" }`

---

### `GET /students/{id}/payments`
Historial de pagos de un alumno específico. Solo admin.

**Query params:**
| Param   | Tipo | Default | Descripción                              |
|---------|------|---------|------------------------------------------|
| `limit` | int  | 20      | Máximo de registros a devolver (max 100) |
| `offset`| int  | 0       | Desde qué registro empezar               |

**Response 200:** Mismo shape paginado que `GET /payments` (envelope con `data`, `total`, `limit`, `offset`).  
**Response 404:** `{ "detail": "Student not found" }`

---

### `DELETE /payments/{id}`
Anula (elimina) un pago registrado por error. Solo admin.

**Response 204:** Sin contenido.  
**Response 404:** `{ "detail": "Payment not found" }`

> **Nota:** Se elimina físicamente. No hay soft delete en esta fase. Si se elimina una mensualidad, el alumno vuelve a aparecer como "sin pagar" en ese mes.

---

## Tabla SQL en Supabase

```sql
create table payments (
  id             uuid          primary key default gen_random_uuid(),
  student_id     uuid          not null references students(id),
  type           text          not null check (type in ('monthly_fee', 'material')),
  period_year    int           check (period_year >= 2020),
  period_month   int           check (period_month between 1 and 12),
  amount         numeric(10,2) not null check (amount > 0),
  payment_method text          not null check (payment_method in ('cash', 'transfer', 'bizum')),
  paid_at        timestamptz   not null default now(),
  created_by     uuid          not null,
  notes          text,
  created_at     timestamptz   not null default now()
);

-- Evita duplicar la mensualidad del mismo alumno en el mismo mes
create unique index payments_monthly_unique
  on payments (student_id, period_year, period_month)
  where type = 'monthly_fee';
```

---

## Fuera de alcance (esta fase)

- Envío de recordatorios automáticos por email (los 5 días son una regla de negocio registrada, el envío queda para otro módulo)
- Marcado automático de inactividad vía job programado (se calcula en `GET /payments/summary`, el admin actúa manualmente con `PATCH /students/{id}`)
- Vista del alumno de sus propios pagos
- Integración con módulo de materiales/pedidos (cuando exista, se añadirá `order_id UUID nullable FK → orders` via migration)
- Procesamiento de pagos online (Stripe, etc.)

# Spec: Módulo de Pedidos (Orders)

**Fase:** 3 — Alumnos en la app  
**Estado:** `draft`  
**Última actualización:** 2026-11-16  
**Depende de:** [`student-accounts.md`](student-accounts.md) (área del alumno y `get_current_student`)

---

## Historia

> Como administrador, quiero publicar un catálogo de material con sus tallas o variantes, para que los alumnos me pidan lo que necesitan sin usar WhatsApp.

> Como alumno, quiero ver el catálogo y pedir material desde la web o el móvil, y saber en qué estado está mi pedido.

> Como administrador, quiero marcar los pedidos como pagados, ver una lista agrupada de lo que tengo que comprar al proveedor, marcarlo como pedido y, al entregarlo, como entregado. Todo desde el móvil.

---

## Reglas de negocio

1. **No se cobra nada en la app.** "Pagado" es un registro administrativo: el admin lo marca cuando recibe el dinero en efectivo, por transferencia o por Bizum, como en [`payments.md`](payments.md).
2. **Un pedido no entra en la compra al proveedor hasta que está pagado.**
3. **El catálogo solo se edita desde la web.** La API lo permite a cualquier admin. Que no aparezca en el móvil es una decisión de la interfaz, no una regla de seguridad.
4. El alumno puede **anular** su pedido mientras esté `requested`. El admin puede **rechazarlo** con un motivo mientras esté `requested`. Una vez pagado, solo el admin puede anularlo, y solo si ninguna línea se ha pedido al proveedor ni entregado.
5. Un alumno inactivo no puede ver el catálogo ni hacer pedidos (403, ver `get_current_student`).
6. Los productos y variantes con pedidos no se borran: se desactivan. Desactivar los saca del catálogo, pero no cambia los pedidos existentes.
7. **El precio se congela al pedir.** Cada línea guarda el nombre y el precio de ese momento, así que cambiar el catálogo no altera pedidos ya hechos.

---

## Estados

El pedido tiene un estado de **pago**. Cada línea, una vez pagado el pedido, tiene un estado de **entrega**. Las dos cosas se separan porque un mismo pedido puede llevar material de proveedores distintos, que llega en momentos distintos.

```
Pedido:   requested ──► paid
              │  └────► rejected   (admin, con motivo)
              └───────► cancelled  (alumno; o admin si está paid y ninguna línea salió de pending)

Línea (solo si el pedido está paid):   pending ──► ordered ──► delivered
                                          └──────────────────► delivered   (material que ya había en el gimnasio)
```

- **Lo que ve el alumno** se deriva así: `requested` → "Solicitado", `paid` con alguna línea `pending` → "Pagado", todas las líneas `ordered` o `delivered` con alguna `ordered` → "Pedido al proveedor", todas `delivered` → "Entregado".
- Las transiciones que no aparecen en el diagrama devuelven **409**.

---

## Modelo de datos

### `products`
| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `id` | uuid | auto | |
| `name` | text | sí | 2–100 chars |
| `description` | text | no | Máx. 1000 chars |
| `is_active` | boolean | sí | Default `true`. Visible en el catálogo |
| `created_at`, `updated_at` | timestamptz | auto | |

### `product_variants`
Todo producto tiene al menos una variante. Un producto sin tallas tiene una sola, con `label` null, y la interfaz no muestra el selector.

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `id` | uuid | auto | |
| `product_id` | uuid FK | sí | → `products.id` |
| `label` | text | no | "12 oz", "M"… Único por producto. Null solo si es la única variante |
| `price` | numeric(10,2) | sí | > 0. Cada variante tiene su precio (unos guantes de 16 oz cuestan más que unos de 10) |
| `is_active` | boolean | sí | Default `true` |
| `position` | int | sí | Orden de las variantes en el selector |

### `orders`
| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `id` | uuid | auto | |
| `number` | int | auto | Número legible y correlativo ("Pedido 42"), `generated always as identity` |
| `student_id` | uuid FK | sí | Sale de `get_current_student`, nunca del cliente |
| `status` | text | sí | `requested` \| `paid` \| `cancelled` \| `rejected` |
| `student_note` | text | no | Máx. 500 chars. Por ejemplo: "para el sábado" |
| `rejection_reason` | text | si `rejected` | Máx. 500 chars. El alumno lo ve |
| `payment_id` | uuid FK | si `paid` | → `payments.id`, el registro creado al marcarlo pagado |
| `paid_at`, `cancelled_at`, `rejected_at` | timestamptz | según estado | |
| `cancelled_by` | text | si `cancelled` | `student` \| `admin` |
| `created_at`, `updated_at` | timestamptz | auto | |

### `order_items`
| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `id` | uuid | auto | |
| `order_id` | uuid FK | sí | → `orders.id` |
| `variant_id` | uuid FK | sí | → `product_variants.id` |
| `product_name`, `variant_label` | text | sí / no | Copia del momento del pedido |
| `unit_price` | numeric(10,2) | sí | Copia del momento del pedido |
| `quantity` | int | sí | 1–20 |
| `fulfilment_status` | text | sí | `pending` \| `ordered` \| `delivered`. Default `pending` |
| `ordered_at`, `delivered_at` | timestamptz | según estado | |

Una variante aparece como máximo una vez por pedido. Si el alumno pide 2 de la misma, es una línea con `quantity` 2.

### Cambio en `payments`
Lo que ya anticipaba `payments.md`: `order_id uuid null references orders(id)`, con índice único parcial (`where order_id is not null`), para que un pedido no tenga dos pagos.

---

## Endpoints

Todos los routers declaran su guard a nivel de router. Las respuestas son schemas Pydantic. Los importes son `Decimal` serializados como en pagos.

### Alumno: `/me/...`, con `get_current_student`
| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/me/catalog` | Productos activos con sus variantes activas |
| POST | `/me/orders` | Crea un pedido: `{ items: [{ variant_id, quantity }], student_note? }`. 1–20 líneas, sin variantes repetidas. Si una variante o su producto está inactivo, 409 y el pedido no se crea |
| GET | `/me/orders` | Mis pedidos con su estado derivado, paginados, del más reciente al más antiguo |
| GET | `/me/orders/{id}` | Detalle. 404 si el pedido no es mío: nunca 403, para no revelar que existe |
| POST | `/me/orders/{id}/cancel` | Anula. Solo si `requested`; si no, 409 |

### Admin: catálogo, con `require_admin`
| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/products` | Todos, también los inactivos, con sus variantes |
| POST | `/products` | Crea un producto con sus variantes en una sola llamada |
| PATCH | `/products/{id}` | Edita nombre, descripción o `is_active` |
| PUT | `/products/{id}/variants` | Reemplaza la lista de variantes. Una variante con pedidos que no viene en la lista se desactiva en vez de borrarse |

### Admin: pedidos, con `require_admin`
| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/orders` | Filtros: `status`, `fulfilment` (`pending` \| `ordered` \| `delivered`), `student_id`. Paginado |
| GET | `/orders/{id}` | Detalle con el alumno, las líneas y el pago enlazado |
| POST | `/orders/{id}/pay` | `{ payment_method, amount? }`. Crea el registro en `payments` (`type: material`, `order_id`, `amount` = total del pedido si no se indica otro, `notes` = "Pedido N: …" con sus líneas) y pasa el pedido a `paid`, todo en una transacción |
| POST | `/orders/{id}/reject` | `{ reason }`. Solo si `requested` |
| POST | `/orders/{id}/cancel` | Solo si `paid` y ninguna línea está `ordered` o `delivered`. Borra el pago enlazado, igual que anular un pago en `payments.md` |
| GET | `/orders/purchase-list` | Líneas `pending` de pedidos `paid`, agrupadas por variante: producto, variante, cantidad total y, por cada línea, `item_id`, el número de pedido, el alumno y la cantidad |
| POST | `/orders/purchase-list/mark-ordered` | `{ item_ids: [...] }`. Marca esas líneas como `ordered`, todas o ninguna: si alguna ya no está `pending`, 409 con sus ids. Recibe ids de línea, no de variante: un pedido pagado entre ver la lista y pulsar el botón no se marca sin haberlo visto |
| POST | `/orders/items/mark-delivered` | `{ item_ids: [...] }`. Desde `pending` u `ordered`. Lo usa tanto "entregar todo el pedido" como entregar una sola línea |

Las operaciones de varios pasos (`pay`, `cancel` con pago, las de listas de líneas) se hacen en **funciones de Postgres llamadas por RPC**, como `replace_gym_schedule` en `gym-profile.md`. Así todo se aplica o nada se aplica, porque el cliente de Supabase no tiene transacciones.

---

## Notificaciones

Cada cambio que el alumno debe conocer genera un evento: pagado, rechazado (con el motivo), anulado por el admin, pedido al proveedor y entregado. Mientras no haya notificaciones push (setup de Capacitor, [ADR 0004](../../../docs/decisions/0004-boxing-gym-mobile-capacitor.md)), el alumno lo ve en "Mis pedidos". El envío push es una spec propia, que reutiliza estos eventos.

---

## Pantallas

**Alumno, web y móvil, diseño mobile-first:**
- **Catálogo:** lista de productos, con un selector de variante si tiene más de una, y precio.
- **Carrito:** cantidades, nota opcional y "Enviar pedido". El texto aclara que el pago se hace en el gimnasio.
- **Mis pedidos:** estado derivado, detalle con sus líneas, motivo de rechazo y "Anular" mientras esté solicitado.

**Admin, móvil y web:**
- **Pedidos:** pestañas *Por cobrar* (`requested`), *Por pedir* (pagados con líneas `pending`), *En camino* (con líneas `ordered`) y *Entregados*. En el detalle: marcar pagado (método e importe), rechazar con motivo, entregar.
- **Lista de compra:** agrupada por producto y variante, con casillas y "Marcar como pedido".

**Admin, solo web:**
- **Catálogo:** crear y editar productos y variantes, y activarlos o desactivarlos.

---

## Migración `005_create_orders.sql`

- Crea `products`, `product_variants`, `orders` y `order_items` con sus `check` y FKs, y **activa RLS en cada una, sin políticas para `anon` ni `authenticated`**: solo se accede por la API.
- Añade `payments.order_id` y su índice único parcial, de forma idempotente (`add column if not exists`).
- Crea las funciones RPC de las operaciones de varios pasos, con `grant execute ... to service_role` y nada más.
- No inserta datos. El catálogo lo crea el admin desde la web.
- Tras ejecutarla, regenerar `schema/public.sql`.

---

## Pruebas

- **Un alumno no puede leer, anular ni ver la existencia de un pedido de otro** (404). Es la prueba que exige el ADR 0005.
- Cada transición válida, y 409 en las inválidas: anular un pedido pagado como alumno, pagar dos veces, rechazar uno pagado, anular como admin con líneas ya pedidas.
- `pay` crea exactamente un pago `material` con el `order_id` y el importe correctos.
- El precio y el nombre se congelan al pedir: editar la variante después no cambia el pedido.
- `purchase-list` solo incluye líneas `pending` de pedidos `paid`, y `mark-ordered` con algún id que ya no está `pending` devuelve 409 con esos ids y no marca ninguno.
- Los routers nuevos pasan `tests/test_router_guards.py`.

---

## Fuera de alcance (esta fase)

- **Fotos de producto.** Requieren almacenamiento (Supabase Storage) y subida desde el panel. Es lo primero a añadir después.
- Stock e inventario.
- Pago online de cualquier tipo.
- Proveedores como entidad: la lista de compra no dice a quién se compra.
- Que el alumno edite un pedido ya enviado (puede anularlo y hacer otro).
- Notificaciones push (spec propia).
